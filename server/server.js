const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {}; // { roomCode: { users: [], poll: {} } }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create room
  socket.on("create_room", (callback) => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    rooms[roomCode] = {
      users: [],
      poll: null,
    };

    socket.join(roomCode);
    callback(roomCode);
  });

  // Join room
  socket.on("join_room", (roomCode, username) => {
    if (rooms[roomCode]) {
      socket.join(roomCode);
      rooms[roomCode].users.push(username);

      io.to(roomCode).emit("update_users", rooms[roomCode].users);
    }
  });

  // Create poll
  socket.on("create_poll", (roomCode, question, options) => {
    rooms[roomCode].poll = {
      question,
      options: options.map((opt) => ({ text: opt, votes: 0 })),
    };

    io.to(roomCode).emit("poll_updated", rooms[roomCode].poll);
  });

  // Vote
  socket.on("vote", (roomCode, optionIndex) => {
    rooms[roomCode].poll.options[optionIndex].votes++;

    io.to(roomCode).emit("poll_updated", rooms[roomCode].poll);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});