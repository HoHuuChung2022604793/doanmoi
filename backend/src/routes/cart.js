const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Lấy giỏ hàng
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price thumbnail stock images');

    if (!cart) {
      cart = { items: [], total: 0 };
    } else {
      // Tính tổng tiền
      let total = 0;
      const validItems = [];
      
      for (const item of cart.items) {
        if (item.product) {
          total += item.product.price * item.quantity;
          validItems.push(item);
        }
      }

      // Cập nhật nếu có item không hợp lệ
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }

      cart = cart.toObject();
      cart.total = total;
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy giỏ hàng',
      error: error.message
    });
  }
});

// Thêm/cập nhật sản phẩm trong giỏ hàng
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, color } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra số lượng tồn kho
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng tồn kho không đủ'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Tạo giỏ hàng mới
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity, color }]
      });
    } else {
      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && item.color === color
      );

      if (itemIndex > -1) {
        // Cập nhật số lượng
        cart.items[itemIndex].quantity += quantity;
        
        // Kiểm tra tồn kho
        if (cart.items[itemIndex].quantity > product.stock) {
          cart.items[itemIndex].quantity = product.stock;
        }
      } else {
        // Thêm sản phẩm mới
        cart.items.push({ product: productId, quantity, color });
      }
    }

    await cart.save();
    await cart.populate('items.product', 'name price thumbnail stock images');

    // Tính tổng tiền
    let total = 0;
    for (const item of cart.items) {
      if (item.product) {
        total += item.product.price * item.quantity;
      }
    }

    const cartObj = cart.toObject();
    cartObj.total = total;

    res.json({
      success: true,
      message: 'Đã thêm vào giỏ hàng',
      data: cartObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm vào giỏ hàng',
      error: error.message
    });
  }
});

// Cập nhật số lượng sản phẩm
router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity, color } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không có trong giỏ hàng'
      });
    }

    // Kiểm tra tồn kho
    const product = await Product.findById(productId);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng tồn kho không đủ'
      });
    }

    if (quantity <= 0) {
      // Xóa sản phẩm nếu số lượng <= 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      if (color) cart.items[itemIndex].color = color;
    }

    await cart.save();
    await cart.populate('items.product', 'name price thumbnail stock images');

    // Tính tổng tiền
    let total = 0;
    for (const item of cart.items) {
      if (item.product) {
        total += item.product.price * item.quantity;
      }
    }

    const cartObj = cart.toObject();
    cartObj.total = total;

    res.json({
      success: true,
      message: 'Đã cập nhật giỏ hàng',
      data: cartObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật giỏ hàng',
      error: error.message
    });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price thumbnail stock images');

    // Tính tổng tiền
    let total = 0;
    for (const item of cart.items) {
      if (item.product) {
        total += item.product.price * item.quantity;
      }
    }

    const cartObj = cart.toObject();
    cartObj.total = total;

    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      data: cartObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa sản phẩm',
      error: error.message
    });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa giỏ hàng',
      error: error.message
    });
  }
});

module.exports = router;
