// Simple WebSocket signaling server for P2P copy-paste UX improvement
// Usage:
// 1. npm install ws
// 2. node signaling-server.js
// Default port: 3000

const WebSocket = require('ws');
const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

// rooms: { roomName: { clientId: ws, ... }, ... }
const rooms = {};

console.log(`Signaling server running on ws://localhost:${port}`);

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let msg;
    try { msg = JSON.parse(message); } catch (e) { return; }

    const { type, room, from, to } = msg;
    if (!type) return;

    switch (type) {
      case 'join': {
        if (!room || !from) return;
        ws.clientId = from;
        ws.room = room;
        rooms[room] = rooms[room] || {};
        rooms[room][from] = ws;

        // send peers list to newly joined client
        const peers = Object.keys(rooms[room]).filter(id => id !== from);
        ws.send(JSON.stringify({ type: 'peers', peers }));

        // notify others
        Object.entries(rooms[room]).forEach(([id, cws]) => {
          if (id !== from) {
            try { cws.send(JSON.stringify({ type: 'peer-joined', id: from })); } catch (e) {}
          }
        });
        break;
      }

      case 'offer':
      case 'answer':
      case 'ice': {
        if (!room || !to) return;
        const target = rooms[room] && rooms[room][to];
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify(msg));
        }
        break;
      }

      default:
        // pass-through
        if (room && to && rooms[room] && rooms[room][to]) {
          try { rooms[room][to].send(JSON.stringify(msg)); } catch (e) {}
        }
        break;
    }
  });

  ws.on('close', () => {
    const { room, clientId } = ws;
    if (!room || !clientId) return;
    if (rooms[room]) {
      delete rooms[room][clientId];
      // notify remaining peers
      Object.values(rooms[room]).forEach(cws => {
        try { cws.send(JSON.stringify({ type: 'peer-left', id: clientId })); } catch (e) {}
      });
      // clear empty room
      if (Object.keys(rooms[room]).length === 0) delete rooms[room];
    }
  });
});
