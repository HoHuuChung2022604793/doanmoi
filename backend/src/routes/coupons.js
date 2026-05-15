const express = require('express');
const Coupon = require('../models/Coupon');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

// @desc    Lấy tất cả mã giảm giá (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách mã giảm giá',
      error: error.message
    });
  }
});

// @desc    Tạo mã giảm giá mới
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({
      success: true,
      message: 'Tạo mã giảm giá thành công',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo mã giảm giá',
      error: error.message
    });
  }
});

// @desc    Cập nhật mã giảm giá
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật mã giảm giá',
      error: error.message
    });
  }
});

// @desc    Xóa mã giảm giá
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }
    res.json({
      success: true,
      message: 'Xóa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa mã giảm giá',
      error: error.message
    });
  }
});

// @desc    Kiểm tra và áp dụng mã giảm giá (User)
// @route   POST /api/coupons/apply
// @access  Private
router.post('/apply', auth, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const now = new Date();

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Mã giảm giá đã hết lượt sử dụng'
      });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()}đ để áp dụng mã này`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        couponId: coupon._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi áp dụng mã giảm giá',
      error: error.message
    });
  }
});

module.exports = router;
