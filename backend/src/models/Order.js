const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  color: String,
  thumbnail: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    ward: String,
    district: { type: String, required: true },
    city: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'banking', 'momo', 'vnpay'],
    default: 'cod'
  },
  paymentProof: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  couponCode: String,
  couponDiscount: {
    type: Number,
    default: 0
  },
  note: String,
  shippingFee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Tạo mã đơn hàng trước khi lưu
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `DH${year}${month}${day}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
