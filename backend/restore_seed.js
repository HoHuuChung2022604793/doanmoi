const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
require('dotenv').config();

// Override for local execution if needed, or use .env
// const uri = 'mongodb://localhost:27017/phone-store';
const uri = process.env.MONGODB_URI;

const generateSeedFromImages = async () => {
  try {
    const uploadDir = path.join(__dirname, 'uploads/products');
    if (!fs.existsSync(uploadDir)) {
      throw new Error('Uploads directory not found!');
    }

    const files = fs.readdirSync(uploadDir).filter(f => !f.startsWith('.'));
    console.log(`📂 Found ${files.length} local images.`);

    if (files.length === 0) {
      console.log('⚠️ No images found to restore.');
      return;
    }

    // Connect DB
    console.log(`🔌 Connecting to ${uri}...`);
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    // Clear old data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Cleared old data.');

    // Create Admin/User (Standard)
    await User.create({
      email: 'admin@phoneshop.com', password: 'admin123', name: 'Admin Store', phone: '0123456789', role: 'admin'
    });
    await User.create({
      email: 'user@example.com', password: 'user123', name: 'Test User', phone: '0987654321', role: 'user'
    });
    console.log('👤 Created default users.');

    // Base Product Templates (High quality metadata)
    const baseProducts = [
        { name: 'iPhone 15 Pro Max', brand: 'Apple', price: 34990000 },
        { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 33990000 },
        { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: 23990000 },
        { name: 'iPhone 14 Pro Max', brand: 'Apple', price: 27990000 },
        { name: 'Google Pixel 8 Pro', brand: 'Google', price: 22990000 },
        { name: 'OPPO Find X7 Ultra', brand: 'OPPO', price: 22990000 },
        { name: 'Vivo X100 Pro', brand: 'Vivo', price: 19990000 },
        { name: 'iPhone 13', brand: 'Apple', price: 13990000 },
        { name: 'Samsung Galaxy A55', brand: 'Samsung', price: 10490000 },
        { name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', price: 4890000 },
        // Add more generic templates if needed to spread images
    ];

    const newProducts = [];
    let fileIndex = 0;

    // We have 187 images. Let's create products until we use them all.
    // We will assign 1-4 images per product.
    
    // First, cycle through meaningful names
    for (let i = 0; i < 50; i++) { // Create 50 products using the templates in loop
        const template = baseProducts[i % baseProducts.length];
        
        // Take 2-4 images for this product
        const numImages = Math.floor(Math.random() * 3) + 2;
        const productImages = [];
        
        for (let j = 0; j < numImages; j++) {
            if (fileIndex < files.length) {
                productImages.push(`/uploads/products/${files[fileIndex]}`);
                fileIndex++;
            }
        }
        
        // If we ran out of images, verify we have at least one, else reuse random
        if (productImages.length === 0) {
             const randomFile = files[Math.floor(Math.random() * files.length)];
             productImages.push(`/uploads/products/${randomFile}`);
        }

        newProducts.push({
            name: `${template.name} ${i > baseProducts.length ? '(Variant ' + i + ')' : ''}`,
            brand: template.brand,
            price: template.price, // Keep original price or randomize slightly
            originalPrice: template.price * 1.1,
            description: `Mô tả cho sản phẩm ${template.name}. Hàng chính hãng, bảo hành 12 tháng.`,
            specs: { screen: '6.7 inch', cpu: 'Flagship Chip', ram: '8GB/12GB', storage: '128GB/256GB' },
            images: productImages,
            thumbnail: productImages[0],
            stock: 50,
            category: 'Phone',
            rating: 4.5,
            numReviews: 10,
            sold: Math.floor(Math.random() * 100)
        });
    }

    await Product.insertMany(newProducts);
    console.log(`📱 Successfully restored ${newProducts.length} products using local images.`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error restoring seed:', error);
    process.exit(1);
  }
};

generateSeedFromImages();
