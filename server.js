const path = require('path');
const http = require('http');
const express = require("express");
const socketio = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
   console.log("New Ws Connection...")

   // Welcome current user (for only client connect)
   socket.emit('message', 'Welcome to ChatCord!');
   // BroadCast when a user connects // BroadCast all User Except me(client connect)
   socket.broadcast.emit('message', 'A user has joined the that');

   // all clients
   io.emit('message', 'A user has joined the chat');

   // Runs when client disconnects
   socket.on('disconnect', () => {
      io.emit('message', 'A user has left the chat');
   });

});

const PORT = 5000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));