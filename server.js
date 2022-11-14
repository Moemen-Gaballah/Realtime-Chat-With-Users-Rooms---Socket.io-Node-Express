const path = require('path');
const http = require('http');
const express = require("express");
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = "ChatCord Bot";

// Run when client connects
io.on('connection', socket => {
   console.log("New Ws Connection...")

   socket.on('joinRoom', ({ username, room}) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // Welcome current user (for only client connect)
      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

      // BroadCast when a user connects // BroadCast all User Except me(client connect)
      socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room)
      });
   });


   // all clients
   // io.emit('message', 'A user has joined the chat');

   // Runs when client disconnects
   socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if(user){
         io.to(user.room).emit('message',  formatMessage(botName, `${user.username} has left the chat`));
      }
   });


   // Listen for chatMessage
   socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message',formatMessage(user.username, msg))
   })

});

const PORT = 5000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));