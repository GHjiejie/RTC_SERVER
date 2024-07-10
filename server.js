const express = require("express");
const https = require("https");
const fs = require("fs");
const socketIo = require("socket.io");

const app = express();

// 读取SSL证书和密钥文件
const options = {
  key: fs.readFileSync("/root/cert/private.key"),
  cert: fs.readFileSync("/root/cert/certificate.crt"),
};

// 创建HTTPS服务器
const server = https.createServer(options, app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const port = 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("userJoined", socket.id);
  });

  socket.on("offer", (data) => {
    const { offer, roomId } = data;
    console.log(`Offer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (data) => {
    const { answer, roomId } = data;
    console.log(`Answer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("iceCandidate", (data) => {
    const { candidate, roomId } = data;
    console.log(`ICE Candidate from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("iceCandidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
    // Optional: You can emit an event to notify other users in the room
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
