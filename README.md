# NHL 27 League

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
- **Awards:** Champion, MVP (players' vote), Presidents' Trophy, Goal Machine, Firepower, Brick Wall and OT Hero. The Awards tab shows the race during the season. MVP voting opens when the regular season ends. Everything becomes final, and votes are revealed, when the host starts the next season.

## Scoring

- 2 points for a win, 1 for an overtime or shootout loss, 0 for a regulation loss.
- Ties in points are broken by wins, then goal difference, then goals for.

## When the access key expires

Sign in as host, go to **Players → GitHub access key**, and paste a new key. Everyone's passwords keep working.

## Fixing mistakes

Every change is a commit, so you can see or revert any edit in this repo's history.
