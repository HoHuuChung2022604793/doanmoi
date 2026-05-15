const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Hãng sản xuất là bắt buộc'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Giá gốc không được âm']
  },
  description: {
    type: String,
    default: ''
  },
  specs: {
    screen: String,        // "6.7 inch AMOLED"
    cpu: String,           // "Snapdragon 8 Gen 2"
    ram: String,           // "8GB"
    storage: String,       // "256GB"
    battery: String,       // "5000mAh"
    camera: String,        // "108MP + 12MP + 5MP"
    os: String             // "Android 14"
  },
  images: [{
    type: String
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  video: {
    type: String, // URL video
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Số lượng tồn kho không được âm'],
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  colors: [{
    type: String
  }],
  discountPercentage: {
    type: Number,
    default: 0
  },
  flashSaleEnd: {
    type: Date
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh hơn
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ brand: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
