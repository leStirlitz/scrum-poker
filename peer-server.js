/**
 * PeerJS signaling server — works locally AND on cloud hosts (Render, Railway, etc.)
 *
 * Local dev:
 *   node scrum-poker/peer-server.js
 *   → listens on port 9000
 *
 * Cloud (Render / Railway):
 *   Set start command to: node peer-server.js
 *   The host injects PORT via environment variable automatically.
 */

const { PeerServer } = require('peer');

const PORT = process.env.PORT || 9000;

const server = PeerServer({
  port: PORT,
  path: '/',
  key: 'peerjs',
  allow_discovery: true,
});

server.on('connection', (client) => {
  console.log(`[peer] connected:  ${client.getId()}`);
});

server.on('disconnect', (client) => {
  console.log(`[peer] disconnect: ${client.getId()}`);
});

console.log(`PeerJS server listening on port ${PORT}`);
