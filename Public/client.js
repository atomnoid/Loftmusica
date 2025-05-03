let ws = new WebSocket(`ws://${location.host}`);
let roomCode = null;

const audioPlayer = document.getElementById('audioPlayer');

function createRoom() {
  ws.send(JSON.stringify({ type: 'create-room' }));
}

function joinRoom() {
  const code = document.getElementById('roomCodeInput').value.trim();
  if (code) {
    ws.send(JSON.stringify({ type: 'join-room', roomCode: code }));
  }
}

function handleChat(e) {
  if (e.key === 'Enter') {
    const msg = e.target.value.trim();
    if (msg) {
      displayMsg(`You: ${msg}`);
      ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { kind: 'chat', msg } }));
      e.target.value = '';
    }
  }
}

function displayMsg(msg) {
  const box = document.getElementById('messages');
  const div = document.createElement('div');
  div.textContent = msg;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

document.getElementById('audioFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
    audioPlayer.play();
    ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { kind: 'play' } }));
  }
});

audioPlayer.addEventListener('play', () => {
  ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { kind: 'play' } }));
});

audioPlayer.addEventListener('pause', () => {
  ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { kind: 'pause' } }));
});

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode);
  alert("Room Code copied!");
}

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  if (type === 'room-created' || type === 'joined-room') {
    roomCode = payload;
    document.getElementById('roomSection').style.display = 'none';
    document.getElementById('music-controls').style.display = 'block';
    document.getElementById('chatBox').style.display = 'block';

    document.getElementById('activeRoom').style.display = 'block';
    document.getElementById('roomLabel').textContent = `Joined Room: ${roomCode}`;
  }

  if (type === 'broadcast') {
    if (payload.kind === 'play') audioPlayer.play();
    if (payload.kind === 'pause') audioPlayer.pause();
    if (payload.kind === 'chat') displayMsg(`Friend: ${payload.msg}`);
  }

  if (type === 'error') alert(payload);
};
