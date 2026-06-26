require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db.js');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// WebRTC Socket Signaling Logics
io.on('connection', (socket) => {
    console.log(`🔌 New Socket Connection: ${socket.id}`);

    // Modified to accept object destructured params from frontend
    socket.on('join-room', ({ roomId }) => {
        socket.join(roomId);
        console.log(`🏠 Socket ${socket.id} joined room: ${roomId}`);

        // Notify the existing peer in the room that a new user has connected
        socket.to(roomId).emit('user-connected', socket.id);

        /* 1. WEBRTC SIGNALING: Offer Brokerage */
        socket.on('offer', (payload) => {
            io.to(payload.target).emit('offer', {
                sdp: payload.sdp,
                sender: socket.id
            });
        });

        /* 2. WEBRTC SIGNALING: Answer Brokerage */
        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', {
                sdp: payload.sdp,
                sender: socket.id
            });
        });

        /* 3. WEBRTC SIGNALING: ICE Candidate Routing Network Triangulation */
        socket.on('ice-candidate', (payload) => {
            io.to(payload.target).emit('ice-candidate', {
                candidate: payload.candidate,
                sender: socket.id
            });
        });

        socket.on('disconnect', () => {
            console.log(`❌ Socket Disconnected: ${socket.id}`);
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});