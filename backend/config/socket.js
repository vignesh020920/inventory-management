const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.user.name} (${socket.userId})`);
    
    // Join user to their personal room
    socket.join(socket.userId);
    
    // Join room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Handle messages
    socket.on('send-message', (data) => {
      const { roomId, message } = data;
      
      // Emit to all users in the room except sender
      socket.to(roomId).emit('receive-message', {
        userId: socket.userId,
        userName: socket.user.name,
        message,
        timestamp: new Date()
      });
    });

    // Handle typing events
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(data.roomId).emit('user-stop-typing', {
        userId: socket.userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.user.name} (${socket.userId})`);
    });
  });
};

module.exports = { setupSocket };