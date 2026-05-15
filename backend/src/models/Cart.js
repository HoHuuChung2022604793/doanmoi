const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải ít nhất là 1'],
    default: 1
  },
  color: {
    type: String,
    default: ''
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Tính tổng tiền giỏ hàng
cartSchema.methods.calculateTotal = async function() {
  await this.populate('items.product');
  
  let total = 0;
  for (const item of this.items) {
    if (item.product && item.product.price) {
      total += item.product.price * item.quantity;
    }
  }
  return total;
};

module.exports = mongoose.model('Cart', cartSchema);
