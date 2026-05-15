const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phone-store';

async function seedOrders() {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const users = await User.find({ role: 'user' });
    const products = await Product.find({ isActive: true });

    if (users.length === 0 || products.length === 0) {
      console.error('Need users and active products to seed orders!');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${products.length} products.`);

    const ordersToCreate = 150; // Generating more for rich data
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, 0, 1); // Start from Jan 1st of last year

    const orderDocuments = [];

    for (let i = 0; i < ordersToCreate; i++) {
      // Random user & 1-3 random products
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const price = product.price;
        
        orderItems.push({
          product: product._id,
          name: product.name,
          price: price,
          quantity: quantity,
          color: product.colors?.[0] || 'Default',
          thumbnail: product.thumbnail || product.images[0]
        });
        totalAmount += price * quantity;
      }

      // Random date between startDate and now
      const orderDate = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
      
      // Random status with weight toward 'delivered'
      const statusSeed = Math.random();
      let status = 'delivered';
      if (statusSeed < 0.1) status = 'pending';
      else if (statusSeed < 0.2) status = 'confirmed';
      else if (statusSeed < 0.3) status = 'shipping';
      else if (statusSeed < 0.4) status = 'cancelled';

      const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      orderDocuments.push({
        user: user._id,
        orderNumber: orderNumber,
        items: orderItems,
        totalAmount: totalAmount + 30000, // + shipping
        shippingFee: 30000,
        shippingAddress: {
          name: user.name,
          phone: user.phone || '0901234567',
          street: 'Số ' + (i + 1) + ' Đường ABC',
          ward: 'Phường Bến Nghé',
          district: 'Quận 1',
          city: 'Hồ Chí Minh'
        },
        paymentMethod: Math.random() > 0.5 ? 'cod' : 'banking',
        status: status,
        paymentStatus: status === 'delivered' ? 'paid' : (Math.random() > 0.5 ? 'paid' : 'pending'),
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    console.log(`Inserting ${orderDocuments.length} orders...`);
    await Order.insertMany(orderDocuments);
    console.log('Seeding completed successfully!');
    
    // Update product sold counts
    console.log('Updating product sales counts...');
    for (const prod of products) {
        const soldCount = orderDocuments.reduce((acc, order) => {
            const item = order.items.find(i => i.product.toString() === prod._id.toString());
            return acc + (item ? item.quantity : 0);
        }, 0);
        await Product.findByIdAndUpdate(prod._id, { $inc: { sold: soldCount } });
    }
    console.log('Product updates completed!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedOrders();
