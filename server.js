// server.js

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));

const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    const { type, roomCode, payload } = data;

    if (type === 'create-room') {
      const code = uuidv4().split('-')[0];
      rooms[code] = [];
      ws.roomCode = code;
      rooms[code].push(ws);
      ws.send(JSON.stringify({ type: 'room-created', payload: code }));
    }

    if (type === 'join-room') {
      if (rooms[roomCode]) {
        ws.roomCode = roomCode;
        rooms[roomCode].push(ws);
        ws.send(JSON.stringify({ type: 'joined-room', payload: roomCode }));
      } else {
        ws.send(JSON.stringify({ type: 'error', payload: 'Room not found' }));
      }
    }

    if (type === 'broadcast') {
      if (rooms[roomCode]) {
        rooms[roomCode].forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'broadcast', payload }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    if (ws.roomCode && rooms[ws.roomCode]) {
      rooms[ws.roomCode] = rooms[ws.roomCode].filter(client => client !== ws);
      if (rooms[ws.roomCode].length === 0) delete rooms[ws.roomCode];
    }
  });
});
