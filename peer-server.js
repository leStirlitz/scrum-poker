/**
 * Local PeerJS signaling server for development.
 *
 * Usage:  node scrum-poker/peer-server.js
 *         (from workspace root, or just: node peer-server.js from inside scrum-poker/)
 *
 * Then open two tabs at http://localhost:8080/scrum-poker.html
 * The app auto-detects localhost and routes PeerJS through this server instead of the cloud.
 */

const { PeerServer } = require('peer');

const PORT = 9000;

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

console.log(`PeerJS server listening on http://localhost:${PORT}/`);
console.log('Now start the HTTP server in a second terminal:');
console.log('  python scrum-poker/test-server.py');
console.log('Then open: http://localhost:8080/scrum-poker.html');
