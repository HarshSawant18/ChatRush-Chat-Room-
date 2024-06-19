const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const users = {};

io.on('connection', (socket) => {

  socket.on('new-user-joined', (name) => {
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
    io.emit('update-user-list', Object.values(users)); // Update the user list for all clients
  });

  socket.on('send', (message,name) => {
    socket.broadcast.emit('receive', { message: message, name: name });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      socket.broadcast.emit('user-left', users[socket.id]);
      delete users[socket.id];
      io.emit('update-user-list', Object.values(users)); // Update the user list for all clients
    }
  });
});

server.listen(8000, () => {
  console.log('Server is running on port 8000');
});
