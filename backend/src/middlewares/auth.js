const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để tiếp tục' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Người dùng không tồn tại' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản đã bị khóa' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn, vui lòng đăng nhập lại' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực' 
    });
  }
};

// Middleware kiểm tra quyền admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền truy cập chức năng này' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi phân quyền' 
    });
  }
};

// Middleware tùy chọn - không bắt buộc đăng nhập
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Bỏ qua lỗi, tiếp tục không có user
    next();
  }
};

module.exports = { auth, adminAuth, optionalAuth };
