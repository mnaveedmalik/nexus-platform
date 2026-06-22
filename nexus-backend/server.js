require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db.js');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

connectDB();

// Create HTTP Server for Express & Socket.io handling
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// WebRTC Socket Signaling Logics
io.on('connection', (socket) => {
    console.log(`🔌 New Socket Connection: ${socket.id}`);

    socket.on('join-room', (roomID, userID) => {
        socket.join(roomID);
        socket.to(roomID).emit('user-connected', userID);

        socket.on('disconnect', () => {
            socket.to(roomID).emit('user-disconnected', userID);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});