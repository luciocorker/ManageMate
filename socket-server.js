/**
 * Socket.IO Server for ManageMate Real-Time Messaging
 *
 * This is a simple Node.js server that handles real-time messaging using Socket.IO.
 * Deploy this on your backend server (e.g., Heroku, AWS, DigitalOcean, etc.)
 *
 * Installation:
 * npm install express socket.io cors
 *
 * Usage:
 * node socket-server.js
 */

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Update this to your app's URL in production
    methods: ["GET", "POST"],
  },
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  const userName = socket.handshake.query.userName;
  console.log(`User connected: ${userName} (${socket.id})`);

  // Store user connection
  if (userName) {
    connectedUsers.set(userName, socket.id);
  }

  // Handle joining a channel/room
  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
    console.log(`${userName} joined channel: ${channelId}`);
  });

  // Handle leaving a channel/room
  socket.on("leave_channel", (channelId) => {
    socket.leave(channelId);
    console.log(`${userName} left channel: ${channelId}`);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    const { channelId, message } = data;

    // Broadcast the message to all users in the channel/room
    io.to(channelId).emit("new_message", message);

    console.log(`Message sent to ${channelId} by ${userName}:`, message.text);
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { channelId, userName } = data;

    // Broadcast typing indicator to others in the channel
    socket.to(channelId).emit("user_typing", { userName, channelId });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userName) {
      connectedUsers.delete(userName);
    }
    console.log(`User disconnected: ${userName} (${socket.id})`);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
