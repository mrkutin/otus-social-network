const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const path = require('path')

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    socket.to(socket.client.id).emit('certain client')
    io.emit('chat message', msg);
  });
});

http.listen(port, host, () => {
  console.log(`Socket.IO server running at http://${host}:${port}/`);
});
