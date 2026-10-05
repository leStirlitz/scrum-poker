# EC Corporate Search Team Scrum Poker

A browser-based planning poker tool for agile estimation. Single HTML file, no server, no installation.

## Quick Start

```powershell
python scrum-poker/test-server.py
```

Open http://localhost:8080/scrum-poker.html

Or open `scrum-poker.html` directly in your browser — it works without a server too (except for test result saving).

## How It Works

Real-time sync between players uses **PeerJS** (WebRTC peer-to-peer). No backend required. The first player to join a room becomes the **host/facilitator**; everyone else connects to them directly.

## Usage

### Starting a Session (Host)
1. Enter your name and a room name → click **Join Room**
2. Share the room name with your team (or use the Copy Link button once it's available)
3. Type the ticket to estimate in the input field and press **Enter**
4. Wait for everyone to vote, then click **Reveal Cards**
5. Click **New Round** to save to history and move on

### Joining a Session (Player)
1. Enter your name and the **same room name** as the host → click **Join Room**
2. Wait for the host to enter a ticket
3. Click a card to vote — your vote is hidden until reveal

### Spectator Mode
Check **Join as spectator** on the join screen to observe without voting.

## Controls

| Button | Who | When | What |
|--------|-----|------|------|
| Reveal Cards | Host only | After votes cast | Shows all votes + stats |
| New Round | Host only | After reveal | Saves to history, resets round |
| Re-vote | Host only | After reveal, no consensus | Clears votes, keeps ticket |
| ✕ Cancel ticket | Host only | Ticket set, before reveal | Clears ticket + votes, no history |
| Export History | Anyone | Anytime | Downloads session as CSV |

## Card Values

`0 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · ? · ☕`

Cards are **locked** (grey, dashed border) until the host enters a ticket. Vote values are **hidden** from other players until reveal — only a ✓ is shown.

## Player Cards

| Style | Meaning |
|-------|---------|
| Green border | Has voted |
| Grey background + `host` badge | Room facilitator |
| Blue background | You |

## Session History

All completed rounds are saved in the history table at the bottom of the page. The total story points are summed automatically. Export to CSV with the **Export History** button.

## Running Tests

```powershell
python scrum-poker/test-server.py
```

Open http://localhost:8080/scrum-poker-tests.html

11 property-based tests validate core logic (room normalisation, vote statistics, consensus detection, CSV export, etc.) using fast-check.

## File Structure

```
scrum-poker/
├── scrum-poker.html           # Main app
├── scrum-poker-helpers.js     # Pure helper functions (shared with tests)
├── scrum-poker-tests.html     # Test runner
├── scrum-poker-test-suites.js # Test definitions
├── scrum-poker-test-runner.js # Test framework
├── scrum-poker-fc-shim.js     # fast-check shim (no CDN needed)
├── test-server.py             # Dev server (port 8080)
└── README.md
```

## Technical Notes

- **No build step** — edit `scrum-poker.html` directly
- **PeerJS v1.5.2** loaded from CDN (jsdelivr)
- **Fibonacci deck**: 0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ☕
- Host peer ID pattern: `scrumpoker-{room}-host`
- Vote secrecy: values never transmitted before reveal — all peers receive `null` until host broadcasts reveal
- localStorage used for session history persistence (key: `scrumpoker-history-{room}`)

## Spec & Design

Full requirements, architecture, and implementation notes:
`.kiro/specs/scrum-poker/`
