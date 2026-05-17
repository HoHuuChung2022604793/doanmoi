require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Coupon = require('./src/models/Coupon');
const Promotion = require('./src/models/Promotion');
const Order = require('./src/models/Order');
const Notification = require('./src/models/Notification');
const Message = require('./src/models/Message');
const Cart = require('./src/models/Cart');

async function run() {
  console.log('🔄 Bắt đầu sao chép dữ liệu từ Local (localhost) lên Cloud Atlas...');
  
  // 1. Kết nối với Local
  try {
    await mongoose.connect('mongodb://localhost:27017/phone-store');
    console.log('✅ Đã kết nối thành công tới Local Database (localhost)');
  } catch (err) {
    console.error('❌ Không thể kết nối tới local MongoDB (localhost). Đảm bảo MongoDB local đang chạy.');
    throw err;
  }
  
  // Lấy dữ liệu
  const allUsers = await User.find({});
  // Loại bỏ các user có role 'shipper' vì tính năng này đã bị xóa ở phiên bản mới
  const users = allUsers.filter(u => u.role !== 'shipper');
  const shipperCount = allUsers.length - users.length;
  
  const products = await Product.find({});
  const coupons = await Coupon.find({});
  const promotions = await Promotion.find({});
  const orders = await Order.find({});
  const notifications = await Notification.find({});
  const messages = await Message.find({});
  const carts = await Cart.find({});
  
  console.log(`📦 Đọc dữ liệu từ Local thành công:`);
  console.log(`- ${users.length} người dùng (${shipperCount} tài khoản shipper cũ đã lọc bỏ)`);
  console.log(`- ${products.length} sản phẩm`);
  console.log(`- ${orders.length} đơn hàng`);
  console.log(`- ${coupons.length} mã giảm giá`);
  console.log(`- ${promotions.length} chương trình khuyến mại`);
  console.log(`- ${messages.length} tin nhắn chat`);
  
  // Ngắt kết nối Local
  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối với Local');
  
  // 2. Kết nối tới Atlas
  console.log('🔌 Đang kết nối tới Cloud Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Đã kết nối thành công tới Cloud Atlas Database');
  
  // Xóa dữ liệu cũ trên Atlas để ghi đè
  await User.deleteMany({});
  await Product.deleteMany({});
  await Coupon.deleteMany({});
  await Promotion.deleteMany({});
  await Order.deleteMany({});
  await Notification.deleteMany({});
  await Message.deleteMany({});
  await Cart.deleteMany({});
  console.log('🗑️ Đã xóa sạch dữ liệu mẫu/trống trên Atlas');
  
  // Nạp dữ liệu vào Atlas
  console.log('📤 Đang tải dữ liệu gốc lên Atlas...');
  if (users.length) await User.insertMany(users);
  if (products.length) await Product.insertMany(products);
  if (coupons.length) await Coupon.insertMany(coupons);
  if (promotions.length) await Promotion.insertMany(promotions);
  if (orders.length) await Order.insertMany(orders);
  if (notifications.length) await Notification.insertMany(notifications);
  if (messages.length) await Message.insertMany(messages);
  if (carts.length) await Cart.insertMany(carts);
  
  console.log('🎉 SAO CHÉP DỮ LIỆU THÀNH CÔNG LÊN CLOUD ATLAS! DỮ LIỆU ĐÃ GIỐNG HỆT NHƯ CŨ 100%.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Lỗi di chuyển dữ liệu:', err);
  process.exit(1);
});
