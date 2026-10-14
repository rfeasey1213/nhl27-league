// Pulls NHL 27 player ratings from EA's public ratings pages into data/ratings.json.
// Runs on GitHub Actions (Node 20+, no dependencies). Writes data/ratings-debug.json
// with a small sample of what EA returned so parsing can be checked and tuned.
import fs from "node:fs/promises";

const OUT = "data/ratings.json", DEBUG = "data/ratings-debug.json";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";
const debug = { startedAt: new Date().toISOString(), attempts: [] };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, accept = "application/json") {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": accept, "Accept-Language": "en-US,en;q=0.9" } });
  const text = await r.text();
  debug.attempts.push({ url, status: r.status, type: r.headers.get("content-type"), bytes: text.length, head: text.slice(0, 600) });
  return { ok: r.ok, status: r.status, text };
}

// ---------- Source 1: EA's ratings data service ----------
async function fromApi() {
  for (const slug of ["nhl-27", "nhl", "nhl-26"]) {
    const items = [];
    for (let offset = 0; offset < 3000; offset += 100) {
      const { ok, text } = await get(`https://drop-api.ea.com/rating/${slug}?locale=en&limit=100&offset=${offset}`);
      if (!ok) break;
      let j; try { j = JSON.parse(text); } catch { break; }
      const page = j.items || j.data || [];
      if (offset === 0) debug.apiSample = { slug, keys: Object.keys(j), total: j.totalItems, first: page.slice(0, 2) };
      items.push(...page);
      if (!page.length || items.length >= (j.totalItems || Infinity)) break;
      await sleep(400);
    }
    if (items.length > 100) { debug.source = "api:" + slug; return items; }
  }
  return null;
}

// ---------- Source 2: the HTML ratings pages ----------
const DIVS = [["atlantic-division", 0], ["metropolitan-division", 1], ["central-division", 2], ["pacific-division", 3]];
function nextData(html) {
  const m = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null; try { return JSON.parse(m[1]); } catch { return null; }
}
function findPlayerArrays(obj, out = [], depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 14) return out;
  if (Array.isArray(obj)) {
    if (obj.length && obj.every(x => x && typeof x === "object") && obj.some(x => ("overallRating" in x) || ("ovr" in x) || ("overall" in x))) out.push(obj);
    for (const x of obj) findPlayerArrays(x, out, depth + 1);
  } else for (const v of Object.values(obj)) findPlayerArrays(v, out, depth + 1);
  return out;
}
const strip = s => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
function tableRows(html) {
  const rows = [];
  for (const tr of html.match(/<tr[\s\S]*?<\/tr>/g) || []) {
    const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/g) || []).map(strip);
    if (cells.length >= 8 && /^\d+$/.test(cells[0])) rows.push(cells);
  }
  return rows;
}
async function fromHtml() {
  const items = [];
  for (const [slug, id] of DIVS) {
    for (let page = 1; page <= 12; page++) {
      const { ok, text } = await get(`https://www.ea.com/en/games/nhl/ratings/conferences-ratings/${slug}/${id}${page > 1 ? "?page=" + page : ""}`, "text/html");
      if (!ok) break;
      const nd = nextData(text);
      let got = [];
      if (nd) { const arrs = findPlayerArrays(nd).sort((a, b) => b.length - a.length); if (arrs[0]) got = arrs[0].map(x => ({ _json: x })); }
      if (!got.length) got = tableRows(text).map(c => ({ _cells: c }));
      if (page === 1 && !debug.htmlSample) {
        const i = text.indexOf("<table");
        debug.htmlSample = { slug, hasNextData: !!nd, tableHtml: i >= 0 ? text.slice(i, i + 4000) : text.slice(0, 2000), firstParsed: got.slice(0, 2) };
      }
      if (!got.length) break;
      const before = items.length;
      for (const g of got) items.push(g);
      // stop when a page repeats the previous one
      if (page > 1 && JSON.stringify(got[0]) === JSON.stringify(items[before - got.length]?.[0])) break;
      if (got.length < 50) break;
      await sleep(500);
    }
  }
  debug.source = "html";
  return items.length ? items : null;
}

// ---------- Normalise ----------
const TEAMS = { "Anaheim Ducks":"ANA","Boston Bruins":"BOS","Buffalo Sabres":"BUF","Calgary Flames":"CGY","Carolina Hurricanes":"CAR","Chicago Blackhawks":"CHI","Colorado Avalanche":"COL","Columbus Blue Jackets":"CBJ","Dallas Stars":"DAL","Detroit Red Wings":"DET","Edmonton Oilers":"EDM","Florida Panthers":"FLA","Los Angeles Kings":"LAK","Minnesota Wild":"MIN","Montréal Canadiens":"MTL","Montreal Canadiens":"MTL","Nashville Predators":"NSH","New Jersey Devils":"NJD","New York Islanders":"NYI","New York Rangers":"NYR","Ottawa Senators":"OTT","Philadelphia Flyers":"PHI","Pittsburgh Penguins":"PIT","San Jose Sharks":"SJS","Seattle Kraken":"SEA","St. Louis Blues":"STL","St Louis Blues":"STL","Tampa Bay Lightning":"TBL","Toronto Maple Leafs":"TOR","Utah Mammoth":"UTA","Utah Hockey Club":"UTA","Vancouver Canucks":"VAN","Vegas Golden Knights":"VGK","Washington Capitals":"WSH","Winnipeg Jets":"WPG" };
const ABBRS = new Set(Object.values(TEAMS));
function teamCode(v) {
  if (!v) return null;
  if (typeof v === "object") v = v.label || v.name || v.fullName || v.abbreviation || v.shortName || "";
  v = String(v).trim();
  if (ABBRS.has(v.toUpperCase())) return v.toUpperCase();
  if (TEAMS[v]) return TEAMS[v];
  const hit = Object.entries(TEAMS).find(([n]) => v.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().endsWith(v.toLowerCase()));
  return hit ? hit[1] : null;
}
const POS = { C: "C", CEN: "C", CENTER: "C", CENTRE: "C", LW: "LW", "LEFT WING": "LW", RW: "RW", "RIGHT WING": "RW", LD: "LD", RD: "RD", D: "D", DEFENSE: "D", DEFENCE: "D", "LEFT DEFENSE": "LD", "RIGHT DEFENSE": "RD", G: "G", GOALIE: "G", GOALTENDER: "G" };
function posCode(v) { if (typeof v === "object" && v) v = v.shortLabel || v.label || v.name || ""; v = String(v || "").toUpperCase().trim(); return POS[v] || (v.startsWith("G") ? "G" : v.endsWith("D") ? "D" : v || "?"); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function normJson(x) {
  const first = x.firstName || "", last = x.lastName || "";
  const name = (x.commonName || x.name || x.fullName || `${first} ${last}`).trim();
  const team = teamCode(x.team || x.teamName || x.club);
  const ovr = num(x.overallRating ?? x.ovr ?? x.overall);
  const pos = posCode(x.position || x.pos || x.positionShortLabel);
  const stats = {};
  for (const [k, v] of Object.entries(x.stats || x.attributes || {})) { const n = num(typeof v === "object" ? v.value : v); if (n != null) stats[k] = n; }
  return { name, team, pos, ovr, stats, ability: x.ability?.label || x.xFactor?.label || null };
}
function normCells(c) {
  // RANK | PLAYER | ABILITY | POS | TEAM | OVR | ACL | SPD | DEK | PAS | SLP | WSP  (ability may be empty or missing)
  let i = 1; const name = c[i++];
  let pos, team, rest;
  const posIdx = c.findIndex((v, k) => k > 1 && POS[v.toUpperCase()]);
  pos = posCode(c[posIdx]); team = teamCode(c[posIdx + 1]); rest = c.slice(posIdx + 2).map(num);
  const [ovr, acl, spd, dek, pas, slp, wsp] = rest;
  return { name, team, pos, ovr, stats: { ACL: acl, SPD: spd, DEK: dek, PAS: pas, SLP: slp, WSP: wsp }, ability: posIdx > 2 ? c[2] || null : null };
}

// ---------- Team ratings (site's own calculation, like a dressed lineup) ----------
function teamRatings(players) {
  const by = p => [...players].filter(p).sort((a, b) => b.ovr - a.ovr);
  const fw = by(p => ["C", "LW", "RW"].includes(p.pos)), d = by(p => ["LD", "RD", "D"].includes(p.pos)), g = by(p => p.pos === "G");
  const avg = a => a.length ? Math.round(a.reduce((s, p) => s + p.ovr, 0) / a.length) : null;
  const off = avg(fw.slice(0, 12)), def = avg(d.slice(0, 6)), goal = g[0]?.ovr ?? null;
  const ovr = off != null && def != null && goal != null ? Math.round(off * 0.45 + def * 0.3 + goal * 0.25) : avg(by(() => true).slice(0, 20));
  return { ovr, off, def, goal };
}

async function main() {
  let raw = await fromApi(), players;
  if (raw) players = raw.map(normJson);
  else { raw = await fromHtml(); if (raw) players = raw.map(x => x._json ? normJson(x._json) : normCells(x._cells)); }
  players = (players || []).filter(p => p.name && p.team && Number.isFinite(p.ovr));
  // de-duplicate (same player can appear on several pages)
  const seen = new Set(); players = players.filter(p => { const k = p.name + "|" + p.team; if (seen.has(k)) return false; seen.add(k); return true; });
  debug.parsedCount = players.length; debug.parsedSample = players.slice(0, 5);
  const teams = {};
  for (const p of players) (teams[p.team] ||= { roster: [] }).roster.push({ name: p.name, pos: p.pos, ovr: p.ovr, stats: p.stats, ability: p.ability || undefined });
  for (const [ab, t] of Object.entries(teams)) { t.roster.sort((a, b) => b.ovr - a.ovr); Object.assign(t, teamRatings(t.roster)); }
  debug.teamCount = Object.keys(teams).length;
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(DEBUG, JSON.stringify(debug, null, 1));
  if (Object.keys(teams).length < 28 || players.length < 400) {
    console.error(`Only parsed ${players.length} players across ${Object.keys(teams).length} teams; keeping the previous ratings file.`);
    process.exitCode = 0; return;
  }
  const out = { game: "NHL 27", source: "EA SPORTS NHL 27 ratings pages (ea.com)", updatedAt: new Date().toISOString(), method: "Team OVR = 45% top-12 forwards + 30% top-6 defense + 25% starting goalie", teams };
  await fs.writeFile(OUT, JSON.stringify(out));
  console.log(`Saved ${players.length} players across ${Object.keys(teams).length} teams.`);
}
main().catch(async e => { debug.error = String(e?.stack || e); await fs.mkdir("data", { recursive: true }); await fs.writeFile(DEBUG, JSON.stringify(debug, null, 1)); console.error(e); });
