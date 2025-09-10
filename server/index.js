import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import hpp from "hpp";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import parser from "socket.io-msgpack-parser";

dotenv.config();

const app = express();

// Security middlewares
app.use(hpp());
app.use(helmet());

// Environment variables
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; 
const PORT = process.env.PORT || 8080;

// CORS setup with fallback
const allowedOrigin = CLIENT_URL || "*";
app.use(cors({ origin: allowedOrigin }));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  parser,
  cors: { origin: allowedOrigin },
});

io.on("connection", (socket) => {
  console.log("⚡ New socket connected:", socket.id);

  socket.on("join", (room) => socket.join(room));
  socket.on("leave", (room) => socket.leave(room));
  socket.on("getElements", ({ elements, room }) =>
    socket.to(room).emit("setElements", elements)
  );

  socket.on("disconnect", () =>
    console.log("⚡ Socket disconnected:", socket.id)
  );
});

// Basic health route
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running" });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
