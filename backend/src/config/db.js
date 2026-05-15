const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Duy trì tối đa 10 kết nối
      serverSelectionTimeoutMS: 5000, // Timeout sau 5s nếu không kết nối được
      socketTimeoutMS: 45000, // Đóng socket sau 45s không hoạt động
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
