const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // New Link Import
const meetingRoutes = require('./routes/meetingRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Injection
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // New Link Injection
app.use('/api/meetings', meetingRoutes);


app.use('/api/test', (req, res) => {
    res.status(200).json({ message: "Nexus Full Backend Suite with User Directory is working perfectly!" });
});

module.exports = app;