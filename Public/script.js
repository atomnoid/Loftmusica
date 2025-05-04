function createRoom() {
  socket.send(JSON.stringify({ type: 'create-room' }));
}

function joinRoom() {
  const code = document.getElementById('roomCodeInput').value;
  socket.send(JSON.stringify({ type: 'join-room', roomCode: code }));
}

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode);
  alert('Room code copied: ' + roomCode);
}

socket.onmessage = (message) => {
  const data = JSON.parse(message.data);
  if (data.type === 'room-created') {
    roomCode = data.payload;
    document.getElementById('roomLabel').innerText = "Room Code: " + roomCode;
    document.getElementById('activeRoom').style.display = 'block';
  }
};
