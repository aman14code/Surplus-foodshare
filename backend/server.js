require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/surplus-food';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const routingRoutes = require('./routes/routing');
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/routes', routingRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // When a user logs in or opens the app, they can join a role-specific room or generic feed
  socket.on('join', (data) => {
    // data can contain user ID, role, etc.
    socket.join('food_feed');
    console.log(`Socket ${socket.id} joined food_feed`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
