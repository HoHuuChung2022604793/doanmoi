const express = require('express');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const { auth, adminAuth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { getCache, setCache, clearCache } = require('../config/redis');

const router = express.Router();

// Lấy danh sách sản phẩm (có filter & search)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      brand, 
      minPrice, 
      maxPrice, 
      search,
      sort = '-createdAt',
      featured
    } = req.query;

    const query = { isActive: true };

    // Filter theo hãng
    if (brand) {
      query.brand = { $in: brand.split(',') };
    }

    // Filter theo giá
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Tìm kiếm
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sản phẩm nổi bật
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Redis Cache Key
    const cacheKey = `products:list:${JSON.stringify(req.query)}`;
    
    // Check Cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        source: 'cache'
      });
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Lấy tất cả khuyến mãi đang hoạt động để tính giá
    const now = new Date();
    const activePromotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Gắn thông tin khuyến mãi vào sản phẩm
    const productsWithPromos = products.map(product => {
      const productObj = product.toObject();
      
      // Tìm các khuyến mãi áp dụng cho sản phẩm này
      const applicablePromos = activePromotions.filter(p => 
        p.products.some(id => id.toString() === product._id.toString())
      );

      if (applicablePromos.length > 0) {
        // Lấy mức giảm giá cao nhất
        const bestPromo = applicablePromos.reduce((prev, current) => 
          (prev.discountPercentage > current.discountPercentage) ? prev : current
        );

        productObj.promotion = {
          name: bestPromo.name,
          discountPercentage: bestPromo.discountPercentage,
          endDate: bestPromo.endDate,
          originalPrice: productObj.price
        };
        // Tính lại giá hiện tại (giá hiển thị sẽ ưu tiên từ promotion)
        productObj.salePrice = Math.round(productObj.price * (1 - bestPromo.discountPercentage / 100));
      }

      return productObj;
    });

    const result = {
      products: productsWithPromos,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    };

    // Save to Cache (1 hour)
    await setCache(cacheKey, result, 3600);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách sản phẩm',
      error: error.message
    });
  }
});

// Lấy danh sách hãng
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    
    // Sắp xếp ưu tiên: Apple > Samsung > OPPO > Xiaomi > Các hãng khác (A-Z)
    const priority = ['Apple', 'Samsung', 'OPPO', 'Xiaomi'];
    const sortedBrands = brands.sort((a, b) => {
      const indexA = priority.indexOf(a);
      const indexB = priority.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Cả 2 có trong priority
      if (indexA !== -1) return -1; // a có, b không
      if (indexB !== -1) return 1;  // b có, a không
      return a.localeCompare(b);    // Còn lại sort A-Z
    });

    res.json({
      success: true,
      data: sortedBrands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách hãng',
      error: error.message
    });
  }
});

// Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const now = new Date();
    let bestDiscount = 0;
    let promoInfo = null;

    // 1. Check Product-level Flash Sale
    if (product.discountPercentage > 0 && product.flashSaleEnd && new Date(product.flashSaleEnd) > now) {
      bestDiscount = product.discountPercentage;
      promoInfo = {
        name: 'Flash Sale (Quick)',
        discountPercentage: product.discountPercentage,
        endDate: product.flashSaleEnd
      };
    }

    // 2. Check Global Promotions
    const activePromos = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      products: product._id
    });

    for (const promo of activePromos) {
      if (promo.discountPercentage > bestDiscount) {
        bestDiscount = promo.discountPercentage;
        promoInfo = {
          _id: promo._id,
          name: promo.name,
          discountPercentage: promo.discountPercentage,
          endDate: promo.endDate
        };
      }
    }

    const productObj = product.toObject();
    productObj.promotion = promoInfo;
    productObj.salePrice = bestDiscount > 0 
      ? Math.round(productObj.price * (1 - bestDiscount / 100)) 
      : productObj.price;

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết sản phẩm',
      error: error.message
    });
  }
});

// Đánh giá sản phẩm
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // 1. Kiểm tra xem đã review chưa
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi'
      });
    }

    // 2. Kiểm tra xem đã mua và nhận hàng chưa
    const Order = require('../models/Order');
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': product._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải mua và nhận hàng thành công mới được đánh giá sản phẩm này'
      });
    }

    // 3. Thêm review
    const review = {
      name: req.user.name || req.user.email,
      rating: Number(rating),
      comment,
      user: req.user._id,
      createdAt: Date.now()
    };

    product.reviews.push(review);

    // 4. Update rating trung bình
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đánh giá sản phẩm',
      error: error.message
    });
  }
});

// ===== ADMIN ROUTES =====

// Lấy tất cả sản phẩm (admin)
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        products,
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
      message: 'Lỗi lấy danh sách sản phẩm',
      error: error.message
    });
  }
});

// Thêm sản phẩm
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Clear Cache
    await clearCache('products:list:*');

    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm sản phẩm',
      error: error.message
    });
  }
});

// Upload ảnh sản phẩm (và payment proof)
router.post('/upload', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

    res.json({
      success: true,
      message: 'Upload ảnh thành công',
      data: imageUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi upload ảnh',
      error: error.message
    });
  }
});

// Cập nhật sản phẩm
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Clear Cache
    await clearCache('products:list:*');
    await clearCache(`products:detail:${req.params.id}`);

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật sản phẩm',
      error: error.message
    });
  }
});

// Xóa sản phẩm
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Clear Cache
    await clearCache('products:list:*');
    await clearCache(`products:detail:${req.params.id}`);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa sản phẩm',
      error: error.message
    });
  }
});

module.exports = router;
