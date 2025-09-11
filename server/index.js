require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const parser = require("socket.io-msgpack-parser");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 8080;

// ✅ Allow all origins (no methods/credentials)
app.use(
  cors({
    origin: "*",
  })
);

const server = http.createServer(app);

// ✅ Socket.IO with all origins allowed
const io = new Server(server, {
  parser,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

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
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (roomSockets && roomSockets.size > 1) {
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

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send(
    `<marquee>To try the app visit : <a href="${CLIENT_URL}">${CLIENT_URL}</a></marquee>`
  );
});

server.listen(PORT, () => {
  console.log("🚀 Server running on port:", PORT);
  console.log("🌍 Allowed client: * (all origins)");
});
