const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Lấy danh sách thông báo
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { user: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({
      success: true,
      data: { notifications, unreadCount, pagination: { current: Number(page), pages: Math.ceil(total / limit), total } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy thông báo', error: error.message });
  }
});

// Đánh dấu đã đọc một thông báo
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi', error: error.message });
  }
});

// Đánh dấu tất cả đã đọc
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi', error: error.message });
  }
});

// Xóa thông báo
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    res.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi', error: error.message });
  }
});

module.exports = router;
