const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // join room (for tutor / quiz rooms)
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // receive tutor message
    socket.on("tutorMessage", (data) => {
      io.to(data.roomId).emit("tutorReply", data);
    });

    // flashcard study updates
    socket.on("flashcardProgress", (data) => {
      socket.broadcast.emit("progressUpdate", data);
    });

    // disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };