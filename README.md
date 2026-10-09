# EC Corporate Search Team Scrum Poker

A browser-based planning poker tool for agile estimation. Single HTML file, real-time peer-to-peer sync via PeerJS (WebRTC).

## 🌐 Try it now

**https://lestirlitz.github.io/scrum-poker/scrum-poker.html**

Open the link, enter a name and room name, share the URL with your team — done. No install, no account, no server required for regular internet users.

> **EC employees on corporate network:** you need the local peer server (see [Local Setup](#local-setup--ec-network) below) because the corporate proxy blocks external WebSocket connections.

Open **two terminals**:

```powershell
# Terminal 1 — PeerJS signaling server (port 9000)
node scrum-poker/peer-server.js

# Terminal 2 — HTTP file server (port 8080)
python scrum-poker/test-server.py
```

Open http://localhost:8080/scrum-poker.html in two browser tabs.

First tab → enter name + room name → **Join Room** (becomes host).  
Second tab → enter different name + **same room name** → **Join Room** (joins as guest).

## Local Setup / EC Network

Open **two terminals**:

The person running the servers shares their VPN IP:

```
http://{your-vpn-ip}:8080/scrum-poker.html
```

The app auto-detects the hostname and routes PeerJS through `{host}:9000` — no config needed.

**First time only** — open firewall ports (run as Administrator):
```powershell
powershell -File scrum-poker/open-firewall-ports.ps1
```

## How It Works

Real-time sync uses **PeerJS** (WebRTC). The first player to join a room becomes the **host/facilitator**; everyone else connects through them. The PeerJS server only handles the initial handshake — it never touches actual game data.

## Usage

### Starting a Session (Host)
1. Enter your name and a room name → click **Join Room**
2. Share the URL (Copy Link button) or just tell teammates the room name
3. Type the ticket to estimate → press **Enter**
4. Wait for everyone to vote → click **Reveal Cards**
5. Click **New Round** to save to history and move on

### Joining a Session (Player)
1. Enter your name and the **same room name** → click **Join Room**
2. Wait for the host to enter a ticket
3. Click a card to vote — your vote is hidden until the host reveals

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

Cards are **locked** until the host enters a ticket. Vote values are **hidden** until reveal — only a ✓ is shown.

## Stats After Reveal

| Stat | Meaning |
|------|---------|
| Average | Raw mean of all numeric votes |
| Min / Max | Lowest and highest vote |
| **Suggested** ✅ | Average rounded to nearest Fibonacci card (ties round up) |

## Player Cards

| Style | Meaning |
|-------|---------|
| Green border | Has voted |
| Grey + `host` badge | Room facilitator |
| Blue background | You |

## Session History

Completed rounds are saved in the history table. Total story points summed automatically. Export to CSV with **Export History**.

## Running Tests

```powershell
python scrum-poker/test-server.py
```

Open http://localhost:8080/scrum-poker-tests.html

Property-based tests validate core logic (room normalisation, vote statistics, consensus detection, Fibonacci rounding, CSV export, etc.) using fast-check.

## File Structure

```
scrum-poker/
├── scrum-poker.html           # Main app
├── scrum-poker-helpers.js     # Pure helper functions (shared with tests)
├── peer-server.js             # Local PeerJS signaling server (port 9000)
├── package.json               # Node deps (peer ^1.0.2)
├── open-firewall-ports.ps1    # One-time firewall setup for VPN sharing
├── scrum-poker-tests.html     # Test runner (local dev only)
├── scrum-poker-test-suites.js # Test definitions
├── scrum-poker-test-runner.js # Test framework (local dev only)
├── scrum-poker-fc-shim.js     # fast-check shim (local dev only)
├── test-server.py             # HTTP dev server (port 8080)
└── README.md
```

## Technical Notes

- **PeerJS v1.5.2** loaded from CDN; signaling handled by local `peer-server.js`
- App auto-detects hostname: on any non-GitHub-Pages host it uses `{hostname}:9000` for PeerJS
- **Fibonacci deck**: 0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ☕
- Host peer ID pattern: `scrumpoker-{room}-host`
- Vote secrecy: values never sent before reveal — peers receive `null` until host broadcasts reveal
- Suggested estimate: Fibonacci-rounded average, ties round up (e.g. avg 4 → 5, avg 17 → 21)

## Spec & Design

Full requirements, architecture, and implementation notes:
`.kiro/specs/scrum-poker/`
