# NHL 27 League

Tabs: **Home** (what's happening now, standings snapshot, latest results, leaders and the news feed), **Standings** (regular season / playoffs), **Games** (schedule / results), **Stats**, **My games** (signed in), **Draft** (before and during the draft; recap linked from Home afterwards) and **Players** (host only).

A league tracker for our NHL 27 group, styled like a Frozen Frenzy night on the ice. It runs a live draft, a 12-game season split into two divisions, best-of-3 playoffs, and tracks goal scorers. Players sign in with a username and password the host creates. Nobody needs a GitHub or Claude account.

Live site: https://rfeasey1213.github.io/nhl27-league/

## How it works

- It's one static page (`index.html`) served by GitHub Pages.
- All league data lives in `data/league.json` in this repo, and every saved game is a commit.
- Saving goes through a fine-grained GitHub access key that can only edit this repo's files. The key is stored encrypted inside `league.json`, and only a correct username and password can unlock it. Viewers who aren't signed in can see everything but can't change anything.

## First-time setup (host)

1. Open the live site. It shows **Set up the league**.
2. Create a fine-grained access key at <https://github.com/settings/personal-access-tokens/new>:
   - Repository access: **Only select repositories** → `nhl27-league`
   - Repository permissions → **Contents: Read and write**
   - Pick the longest expiration offered
3. Fill in the league name, your username, password, and the key. You're now the host.
4. On the **Players** tab, add each friend with a username and password, then send them their login.

## How a season runs

1. **Pre-draft:** the host adds players on the Players tab and sets the pick order on the Draft tab.
2. **Live draft:** each player signs in and picks one NHL team on their turn. The page updates every few seconds. The host can pick for anyone who's away, undo the last pick, or cancel.
3. **Divisions:** when the last pick is in, players are split randomly into two divisions. The host can reshuffle before any game is played and rename the divisions in League settings.
4. **Regular season:** each player plays 12 games, 6 at home and 6 away (the host can change the number before the season starts). Goal scorers can be added to each game.
5. **Playoffs:** they start automatically after the last regular season game, using the host's playoff spots per division (default top 2). The host can also start them early. Series are best of 3, played within each division, and the two division champions meet in the league final. Playoff games go to overtime, never a shootout.
6. **Next season:** after a champion is crowned, the host taps **Start Season 2** (or 3, 4…). The finished season is archived in full: every game, score and goal scorer, the draft, divisions and playoff bracket. Then a new draft opens. Players and passwords stay.
7. **Archive:** the **Viewing** picker under the tabs switches between the current season, any past season, and **All-time** (career standings with titles and playoff records, plus all-time scorers).

## Profiles, rivalries and awards

- **Profiles:** tap any player's name to see their all-time record, points, goals, playoff record, longest and current win streak, head-to-head against every friend, best scorers, awards, season-by-season finishes and every game they've played.
- **Rivalries:** every game card shows the all-time series between the two players. The All-time view has a full rivalry grid.
- **Awards and Season review:** Champion, MVP (players' vote), Presidents' Trophy, Goal Machine, Firepower, Brick Wall and OT Hero appear in the **Season review** (button on the champion banner, or next to the season picker for past seasons), along with final standings, top scorers, biggest moments and season totals. MVP voting sits on the Playoffs tab during the playoffs; awards lock in and votes are revealed when the host starts the next season. All-time → **Trophy cabinet** lists every award.

## Draft lottery

Before the draft the host gives every player a tier (Tier 1 = most skilled, Tier 4 = least) on the Draft tab. Each player gets lottery balls by tier (default 40 / 25 / 15 / 8 for Tiers 4 / 3 / 2 / 1). The top 3 picks are drawn by weighted lottery; everyone else follows in reverse tier order, shuffled within each tier. The host reveals the picks live, last to first. Every run is saved and visible, including re-runs.

## My games

Signed-in players see only their own schedule and can log any of their games in any order. Logged games can be edited later by either player, whoever logged it, or the host. Playoff edits that would undo a series result later games depend on are blocked.

## Resets (host)

- **Back to draft day:** clears games, playoffs, divisions and picks, then restarts the draft with the same order.
- **Reset league:** also clears the draft and lottery and goes back to setting tiers and the order.

## Stats

The **Stats** tab, which also holds the goal scorers leaderboard, (regular season, playoffs or all games; any season or all-time) shows league totals, a points race chart, stat leaders (offence, defence, home, road, clutch, shutouts, streaks, upsets, over/underachievers), a sortable player stats table, NHL teams vs their ratings, and league records. "vs Exp." compares wins with what team rating plus preseason tier predicted.

## Draft clock

Each pick has a timer (default 2 minutes; the host can change it in League settings or turn it off). When it runs out, the best-rated team left is picked automatically and marked **Auto**. Auto-picks happen when anyone signed in has the site open. The host can pause, resume, or auto-pick early.

## Commissioner (host)

Players tab → **Commissioner**: change any player's NHL team, division and tier, and add or remove standings points with a reason. Edit playoff seeds before the first playoff game. Log, edit or delete any game, including forfeits.

## Badges and news

Games get badges for hat tricks, shutouts, comebacks (entered when logging), blowouts (4+ goals), goal fests (10+ total) and upsets. An upset compares team rating plus a bonus for the player's preseason tier (Tier 1 +9, Tier 2 +6, Tier 3 +3, Tier 4 +0): 5+ points is an upset, 10+ a big upset. The **News** tab writes headlines from these, plus win streaks, snapped streaks, series results, the lottery and draft. The host can post announcements.

## NHL 27 ratings

A GitHub Action (`.github/workflows/ratings.yml`) runs every Monday and whenever the importer changes. It reads EA SPORTS' public NHL 27 ratings pages and saves `data/ratings.json`. EA's site lists the league's top 300 players, so each team shows its best 7–10 players. Team overall = 45% top forwards + 30% top defensemen + 25% starting goalie (estimated for teams with no goalie in EA's list). You can also run it by hand from the repo's **Actions** tab → *Update NHL 27 ratings* → **Run workflow**.

## Playoff settings (host)

Players tab → **Playoff settings**: division brackets or one league-wide bracket; how many make it; series length for the first round, later rounds and the final (1, 3, 5 or 7 games); home ice (alternating or NHL 2-2-1-1-1); shootouts allowed or not; and whether the playoffs start automatically. Settings lock while a playoff is running.

## Scoring

- 2 points for a win, 1 for an overtime or shootout loss, 0 for a regulation loss.
- Ties in points are broken by wins, then goal difference, then goals for.

## When the access key expires

Sign in as host, go to **Players → GitHub access key**, and paste a new key. Everyone's passwords keep working.

## Fixing mistakes

Every change is a commit, so you can see or revert any edit in this repo's history.
