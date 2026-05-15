const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

// Tạo user mới (admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    const user = new User({
      email,
      password,
      name,
      phone,
      role: role || 'user',
      isActive: true
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo tài khoản',
      error: error.message
    });
  }
});

// Lấy danh sách users (admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách người dùng',
      error: error.message
    });
  }
});

// Lấy chi tiết user (admin)
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng',
      error: error.message
    });
  }
});

// Cập nhật user (admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật người dùng',
      error: error.message
    });
  }
});

// Khóa/Mở khóa user (admin)
router.put('/:id/toggle-status', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép tự khóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể thay đổi trạng thái của chính mình'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thay đổi trạng thái',
      error: error.message
    });
  }
});

// Xóa user (admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Không cho phép tự xóa chính mình
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chính mình'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa người dùng'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa người dùng',
      error: error.message
    });
  }
});

// Thống kê users (admin)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Users mới trong 30 ngày
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        newUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê',
      error: error.message
    });
  }
});

module.exports = router;
