const ws = new WebSocket(`ws://${location.host}`);
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('code');

if (roomCode) {
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join-room', roomCode }));
    document.getElementById('roomDisplay').innerText = `Room: ${roomCode}`;
  }
}

const audioFile = document.getElementById('audioFile');
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

audioFile && audioFile.addEventListener('change', () => {
  const file = audioFile.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audioPlayer.src = url;
  }
});

playBtn && playBtn.addEventListener('click', () => {
  audioPlayer.play();
  ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { action: 'play' } }));
});

pauseBtn && pauseBtn.addEventListener('click', () => {
  audioPlayer.pause();
  ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { action: 'pause' } }));
});

sendBtn && sendBtn.addEventListener('click', () => {
  const msg = chatInput.value.trim();
  if (msg) {
    const display = `You: ${msg}`;
    addMessage(display);
    ws.send(JSON.stringify({ type: 'broadcast', roomCode, payload: { action: 'chat', message: msg } }));
    chatInput.value = '';
  }
});

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.type === 'broadcast') {
    const payload = data.payload;
    if (payload.action === 'play') audioPlayer.play();
    if (payload.action === 'pause') audioPlayer.pause();
    if (payload.action === 'chat') addMessage(`Friend: ${payload.message}`);
  }
}

function addMessage(message) {
  const p = document.createElement('p');
  p.innerText = message;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}
