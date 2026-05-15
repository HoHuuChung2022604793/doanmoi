const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Middleware xác thực socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Chưa đăng nhập'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User không tồn tại'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Token không hợp lệ'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user._id})`);

    // Join room theo user ID
    socket.join(`user_${socket.user._id}`);

    // Xử lý typing
    socket.on('typing', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    // Xử lý stop typing
    socket.on('stop_typing', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('user_stop_typing', { userId: socket.user._id });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = setupSocket;
