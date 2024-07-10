const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // 允许所有来源连接，生产环境中请修改为你的前端域名
  },
});

const PORT = 3000;

io.on("connection", (socket) => {
  console.log("用户连接:", socket.id);

  socket.on("joinRoom", (roomId) => {
    console.log(`用户 ${socket.id} 加入房间 ${roomId}`);
    socket.join(roomId);

    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    const numClients = roomSockets ? roomSockets.size : 0;

    if (numClients > 1) {
      // 如果房间里已经有其他人，通知新用户向其他人发送 offer
      socket.emit("createOffer");
    }

    socket.on("offer", (offer) => {
      console.log(`收到来自 ${socket.id} 的 offer`);
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      console.log(`收到来自 ${socket.id} 的 answer`);
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("candidate", (candidate) => {
      console.log(`收到来自 ${socket.id} 的 ICE candidate`);
      socket.to(roomId).emit("candidate", candidate);
    });

    socket.on("disconnect", () => {
      console.log(`用户 ${socket.id} 断开连接`);
      socket.to(roomId).emit("userDisconnected");
    });
  });
});

server.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));
