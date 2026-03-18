let io = null;

const initIO = (server) => {
  const socketIO = require("socket.io");
  const origins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:3000", "http://localhost:9011"];

  io = socketIO(server, {
    cors: { origin: origins, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("joinChatBox", (data) => {
      if (data?.ticketId) socket.join(`ticket-${data.ticketId}`);
    });
    socket.on("joinTickets", () => {
      socket.join("tickets");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO não inicializado. Chame initIO(server) primeiro.");
  return io;
};

module.exports = { initIO, getIO };
