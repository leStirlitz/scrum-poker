# 🃏 Scrum Poker Planning

A real-time Scrum Poker planning tool for agile teams. No installation required - works directly in the browser!

**🌐 Live Demo:** [https://yourusername.github.io/scrum-poker/](https://yourusername.github.io/scrum-poker/)

## Features

- **Real-time collaboration** - Connect with teammates anywhere via peer-to-peer
- **Fibonacci sequence** - Standard poker values (0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ☕)
- **Room-based sessions** - Create multiple rooms for different teams
- **Story tracking** - Enter the ticket/story being estimated
- **Vote statistics** - Average, min, max shown after reveal
- **Session history** - Track all estimated tickets with votes and timestamps
- **Export to CSV** - Download your estimation history
- **No server required** - Uses PeerJS for peer-to-peer connections

## How to Use

1. Open the app (or `index.html` locally)
2. Enter your name and a room name (e.g., "sprint-planning")
3. Share the same room name with your team
4. Enter the ticket/story to estimate
5. Everyone votes by clicking a card
6. Click "Reveal Cards" to show all votes
7. Click "New Round" to save and start the next estimation
8. Click "Export History" to download a CSV of all estimates

## Deployment

This is a single HTML file that can be hosted anywhere:

### GitHub Pages
1. Fork this repository
2. Go to Settings → Pages → Source: main branch
3. Access at `https://yourusername.github.io/scrum-poker/`

### Local Use
Just open `index.html` in your browser - no server needed!

## Tech Stack

- Vanilla JavaScript (no frameworks)
- PeerJS for peer-to-peer WebRTC connections
- Single HTML file (easy to share and deploy)
