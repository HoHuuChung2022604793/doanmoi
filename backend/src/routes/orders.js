const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middlewares/auth');
const { createPaymentUrl, verifyReturnUrl } = require('../utils/vnpay.util');

const router = express.Router();

// Lấy lịch sử đơn hàng của user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách đơn hàng', error: error.message });
  }
});
// Đặt hàng
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', note } = req.body;

    // Lấy giỏ hàng
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Kiểm tra tồn kho và tính tổng
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) continue;

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.product.name}" không đủ số lượng tồn kho`
        });
      }

      totalAmount += item.product.price * item.quantity;
      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.color,
        thumbnail: item.product.thumbnail || item.product.images[0]
      });
    }

    // Phí ship cố định
    const shippingFee = 30000;
    let finalTotal = totalAmount + shippingFee;
    let couponDiscount = 0;
    let appliedCoupon = null;

    // Áp dụng Mã giảm giá (nếu có)
    if (req.body.couponCode) {
      const now = new Date();
      appliedCoupon = await Coupon.findOne({
        code: req.body.couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      if (appliedCoupon) {
        const canUse = appliedCoupon.usageLimit === 0 || appliedCoupon.usedCount < appliedCoupon.usageLimit;
        const validAmount = totalAmount >= appliedCoupon.minOrderAmount;

        if (canUse && validAmount) {
          if (appliedCoupon.discountType === 'percentage') {
            couponDiscount = (totalAmount * appliedCoupon.discountValue) / 100;
            if (appliedCoupon.maxDiscountAmount > 0 && couponDiscount > appliedCoupon.maxDiscountAmount) {
              couponDiscount = appliedCoupon.maxDiscountAmount;
            }
          } else {
            couponDiscount = appliedCoupon.discountValue;
          }
          finalTotal -= couponDiscount;
          if (finalTotal < shippingFee) finalTotal = shippingFee;
        }
      }
    }

    // Tạo đơn hàng
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod,
      note,
      shippingFee,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      couponDiscount: couponDiscount
    });

    await order.save();

    // Cập nhật số lần dùng mã & Tồn kho
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
    }
    for (const item of cart.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity, sold: item.quantity }
        });
      }
    }

    // Xóa giỏ hàng
    await Cart.findOneAndDelete({ user: req.user._id });

    // Thông báo đặt hàng
    const notification = new Notification({
      user: req.user._id,
      type: 'order',
      title: 'Đặt hàng thành công',
      content: `Đơn hàng ${order.orderNumber} đã được đặt thành công.`,
      data: { orderId: order._id }
    });
    await notification.save();
    const io = req.app.get('io');
    if (io) io.to(`user_${req.user._id}`).emit('new_notification', notification);

    // XỬ LÝ VNPAY
    if (paymentMethod === 'vnpay') {
      const vnpUrl = createPaymentUrl({
        amount: finalTotal,
        orderId: order.orderNumber,
        orderInfo: `Thanh toan don hang ${order.orderNumber}`,
        ipAddr: req.ip || '127.0.0.1'
      });

      return res.status(201).json({
        success: true,
        message: 'Chuyển hướng đến cổng thanh toán VNPay',
        data: { ...order.toObject(), paymentUrl: vnpUrl }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi đặt hàng', error: error.message });
  }
});

// Route xử lý khi VNPay redirect về cổng thanh toán của website (User)
router.get('/vnpay-return', auth, async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isValid = verifyReturnUrl(vnp_Params);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
    }

    const responseCode = vnp_Params['vnp_ResponseCode'];
    const orderNumber = vnp_Params['vnp_TxnRef'];

    const order = await Order.findOne({ orderNumber }).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (responseCode === '00') {
      order.paymentStatus = 'paid';
      await order.save();
      return res.json({ success: true, message: 'Thanh toán VNPay thành công', data: order });
    } else {
      // Thanh toán thất bại -> Hủy đơn hàng hoặc để pending? 
      // Thông thường là hủy đơn hoặc cho phép thanh toán lại. Ở đây ta giữ nguyên pending nhưng báo lỗi.
      return res.json({ 
        success: false, 
        message: 'Thanh toán thất bại hoặc đã bị khách hàng hủy',
        code: responseCode 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xử lý kết quả VNPay', error: error.message });
  }
});

// IPN - Callback server-to-server của VNPay
router.get('/vnpay-ipn', async (req, res) => {
  try {
    let vnp_Params = req.query;
    const isValid = verifyReturnUrl(vnp_Params);

    if (isValid) {
      const orderNumber = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const order = await Order.findOne({ orderNumber });

      if (order) {
        if (order.paymentStatus !== 'paid') {
          if (responseCode === "00") {
            order.paymentStatus = 'paid';
            await order.save();
            // Trả về cho VNPay kết quả thành công
            res.json({ RspCode: '00', Message: 'Confirm success' });
          } else {
            // Thanh toán lỗi -> Có thể hoàn tồn kho ở đây nếu muốn hủy đơn ngay
            res.json({ RspCode: '00', Message: 'Confirm success (Payment Failed)' });
          }
        } else {
          res.json({ RspCode: '02', Message: 'Order already confirmed' });
        }
      } else {
        res.json({ RspCode: '01', Message: 'Order not found' });
      }
    } else {
      res.json({ RspCode: '97', Message: 'Invalid Checksum' });
    }
  } catch (error) {
    res.status(500).json({ RspCode: '99', Message: 'Unknow error' });
  }
});


// Lấy chi tiết đơn hàng
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết đơn hàng', error: error.message });
  }
});

// Cập nhật bằng chứng thanh toán (User)
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentProof } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Không thể cập nhật thanh toán cho đơn hàng này' });
    }

    order.paymentProof = paymentProof;
    await order.save();

    res.json({
      success: true,
      message: 'Đã cập nhật ảnh chuyển khoản',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thanh toán',
      error: error.message
    });
  }
});

// Hủy đơn hàng
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Hoàn lại số lượng tồn kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }

    res.json({
      success: true,
      message: 'Đã hủy đơn hàng',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi hủy đơn hàng',
      error: error.message
    });
  }
});

// ===== ADMIN ROUTES =====

// Lấy tất cả đơn hàng (admin)
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        orders,
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
      message: 'Lỗi lấy danh sách đơn hàng',
      error: error.message
    });
  }
});

// Cập nhật trạng thái đơn hàng (admin)
router.put('/admin/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Trạng thái thanh toán không hợp lệ' });
      }
      updateData.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Tạo thông báo cho user
    const statusText = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };

    const notification = new Notification({
      user: order.user._id,
      type: 'order_status',
      title: 'Cập nhật đơn hàng',
      content: `Đơn hàng ${order.orderNumber} đã chuyển sang trạng thái: ${statusText[status]}`,
      data: { orderId: order._id }
    });
    await notification.save();

    // Gửi thông báo realtime
    const io = req.app.get('io');
    io.to(`user_${order.user._id}`).emit('new_notification', notification);
    io.to(`user_${order.user._id}`).emit('order_status', { 
      orderId: order._id, 
      status, 
      statusText: statusText[status] 
    });

    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái đơn hàng',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái',
      error: error.message
    });
  }
});

// Thống kê đơn hàng (admin)
router.get('/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();
    let startDate = new Date();
    let groupFormat = "%Y-%m-%d";
    let labelsCount = 7;

    switch (period) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        groupFormat = "%Y-%m-%d";
        labelsCount = 30;
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        groupFormat = "%Y-%m";
        labelsCount = 12;
        break;
      default: // 7d
        startDate.setDate(now.getDate() - 7);
        groupFormat = "%Y-%m-%d";
        labelsCount = 7;
    }

    // Revenue stats over time
    const revenueStats = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          revenue: 1,
          orderCount: 1,
          customerCount: { $size: "$uniqueUsers" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Overall status stats
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        revenueStats,
        totalOrders,
        totalRevenue: totalRevenueResult[0]?.total || 0,
        period
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
