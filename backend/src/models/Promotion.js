const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên chương trình khuyến mãi là bắt buộc'],
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Tỷ lệ giảm giá là bắt buộc'],
    min: [1, 'Giảm giá phải từ 1%'],
    max: [100, 'Giảm giá không quá 100%']
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Kiểm tra xem khuyến mãi có đang diễn ra không
promotionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

module.exports = mongoose.model('Promotion', promotionSchema);
