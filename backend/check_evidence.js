const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User'); // Required for reference
const Product = require('./src/models/Product'); // Required for reference
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const order = await Order.findOne({ deliveryImage: { $exists: true, $ne: null } })
      .sort({ updatedAt: -1 })
      .select('deliveryImage status updatedAt');
    
    console.log('Latest Order with Evidence:', order);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
