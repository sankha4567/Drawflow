 require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const parser = require("socket.io-msgpack-parser");

const CLIENT_URL = process.env.CLIENT_URL;
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    //origin: [CLIENT_URL],
     origin: [CLIENT_URL],
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  parser,
  cors: {
    origin: [CLIENT_URL],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("leave", (room) => {
    socket.leave(room);
  });

  socket.on("getElements", ({ elements, room }) => {
    socket.to(room).emit("setElements", elements);
  });

  socket.on("requestElements", (room) => {
    // Get all sockets in the room
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (roomSockets && roomSockets.size > 1) {
      // Find another socket in the room to request elements from
      for (const socketId of roomSockets) {
        if (socketId !== socket.id) {
          io.to(socketId).emit("sendElements", socket.id);
          break;
        }
      }
    }
  });

  socket.on("sendElements", ({ elements, targetSocketId }) => {
    io.to(targetSocketId).emit("setElements", elements);
  });
});

app.get("/", (req, res) => {
  res.send(
    `<marquee>To try the app visit : <a href="${CLIENT_URL}">${CLIENT_URL}</a></marquee>`
  );
});

server.listen(PORT, () => {
  console.log("Listen in port : " + PORT);
});
