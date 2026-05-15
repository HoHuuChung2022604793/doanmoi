const express = require('express');
const Promotion = require('../models/Promotion');
const { auth, adminAuth } = require('../middlewares/auth');
const { clearCache } = require('../config/redis');

const router = express.Router();

// @desc    Lấy tất cả chương trình khuyến mãi (Admin)
// @route   GET /api/promotions
// @access  Private/Admin
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const promotions = await Promotion.find().populate('products', 'name price brand').sort('-createdAt');
    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách khuyến mãi',
      error: error.message
    });
  }
});

// @desc    Tạo chương trình khuyến mãi mới
// @route   POST /api/promotions
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();

    // Clear Product Cache
    await clearCache('products:list:*');
    await clearCache('products:detail:*');

    res.status(201).json({
      success: true,
      message: 'Tạo khuyến mãi thành công',
      data: promotion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo khuyến mãi',
      error: error.message
    });
  }
});

// @desc    Cập nhật chương trình khuyến mãi
// @route   PUT /api/promotions/:id
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi'
      });
    }

    // Clear Product Cache
    await clearCache('products:list:*');
    await clearCache('products:detail:*');

    res.json({
      success: true,
      message: 'Cập nhật khuyến mãi thành công',
      data: promotion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật khuyến mãi',
      error: error.message
    });
  }
});

// @desc    Xóa chương trình khuyến mãi
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi'
      });
    }

    // Clear Product Cache
    await clearCache('products:list:*');
    await clearCache('products:detail:*');

    res.json({
      success: true,
      message: 'Xóa khuyến mãi thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa khuyến mãi',
      error: error.message
    });
  }
});

module.exports = router;
