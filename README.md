# NHL 27 League

A league tracker for our NHL 27 group. It shows standings, a home-and-away schedule where everyone plays everyone twice, and results. Players sign in with a username and password the host creates. Nobody needs a GitHub or Claude account.

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

## Scoring

- 2 points for a win, 1 for an overtime or shootout loss, 0 for a regulation loss.
- Ties in points are broken by wins, then goal difference, then goals for.

## When the access key expires

Sign in as host, go to **Players → GitHub access key**, and paste a new key. Everyone's passwords keep working.

## Fixing mistakes

Every change is a commit, so you can see or revert any edit in this repo's history.
