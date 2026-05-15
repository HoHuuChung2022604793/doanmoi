const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');
const passport = require('passport');
const upload = require('../middlewares/upload');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const router = express.Router();

// --- Social Login Routes ---

// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate token
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend with token
    res.redirect(`http://localhost:4200/auth/callback?token=${token}`);
  }
);

// Facebook Login
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook Callback
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:4200/auth/callback?token=${token}`);
  }
);

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Tạo user mới
    const user = new User({
      email,
      password,
      name,
      phone
    });

    await user.save();

    // Tạo token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký',
      error: error.message
    });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Kiểm tra password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    });
  }
});

// Lấy thông tin profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin',
      error: error.message
    });
  }
});

// Cập nhật profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật',
      error: error.message
    });
  }
});

// ... (existing imports)

// POST /profile/avatar
router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh'
      });
    }

    const avatarUrl = `/uploads/products/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật ảnh đại diện',
      error: error.message
    });
  }
});

// Đổi mật khẩu
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đổi mật khẩu',
      error: error.message
    });
  }
});

// Quên mật khẩu - Gửi token qua email
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với email này'
      });
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Lưu token đã hash vào DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token hết hạn sau 10 phút
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Tạo link reset
    const resetUrl = `${req.protocol}://${req.get('host').replace(':5001', ':4200')}/auth/reset-password/${resetToken}`;

    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n\nVui lòng nhấp vào liên kết sau hoặc dán vào trình duyệt để hoàn tất quá trình:\n\n${resetUrl}\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ vẫn không thay đổi.\n`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Khôi phục mật khẩu - Chung Mobile',
        message,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Khôi phục mật khẩu</h2>
            <p>Chào ${user.name},</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>Chung Mobile</strong>.</p>
            <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn (liên kết có hiệu lực trong 10 phút):</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
            </div>
            <p>Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết này vào trình duyệt:</p>
            <p style="color: #666; font-size: 12px;">${resetUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">Đây là email tự động, vui lòng không phản hồi.</p>
          </div>
        `
      });

      res.json({
        success: true,
        message: 'Email khôi phục đã được gửi'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Lỗi gửi email',
        error: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý yêu cầu',
      error: error.message
    });
  }
});

// Đặt lại mật khẩu với token
router.post('/reset-password/:token', async (req, res) => {
  try {
    // Hash token từ URL để so sánh với DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đặt lại mật khẩu',
      error: error.message
    });
  }
});

module.exports = router;
