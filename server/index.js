const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const lobbies = {}; // { roomCode: [users] }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_room", (roomCode) => {
    lobbies[roomCode] = [];
    socket.join(roomCode);
    lobbies[roomCode].push(socket.id);

    io.to(roomCode).emit("room_update", lobbies[roomCode]);
  });

  socket.on("join_room", (roomCode) => {
    if (!lobbies[roomCode]) {
      lobbies[roomCode] = [];
    }

    socket.join(roomCode);
    lobbies[roomCode].push(socket.id);

    io.to(roomCode).emit("room_update", lobbies[roomCode]);
  });

  socket.on("disconnecting", () => {
    const rooms = socket.rooms;

    rooms.forEach((room) => {
      if (lobbies[room]) {
        lobbies[room] = lobbies[room].filter((id) => id !== socket.id);
        io.to(room).emit("room_update", lobbies[room]);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});