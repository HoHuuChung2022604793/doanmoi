const mongoose = require('mongoose');
require('dotenv').config();

// CẤU HÌNH: Thay mật khẩu của bạn vào đây
const LOCAL_URI = 'mongodb://localhost:27017/phone-store';
const CLOUD_URI = 'mongodb://huuchung10a2:1234@ac-brpt8xt-shard-00-00.vkgunvv.mongodb.net:27017,ac-brpt8xt-shard-00-01.vkgunvv.mongodb.net:27017,ac-brpt8xt-shard-00-02.vkgunvv.mongodb.net:27017/phone-store?ssl=true&replicaSet=atlas-m4e3p5-shard-0&authSource=admin&retryWrites=true&w=majority';

async function migrate() {
  try {
    console.log('🚀 Đang kết nối tới Database nội bộ...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Đã kết nối Database nội bộ');

    console.log('🚀 Đang kết nối tới MongoDB Atlas (Cloud)...');
    const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
    console.log('✅ Đã kết nối MongoDB Atlas');

    const collections = ['products', 'users', 'orders', 'categories', 'carts', 'notifications', 'chats'];

    for (const colName of collections) {
      console.log(`📦 Đang chuyển collection: ${colName}...`);

      const documents = await localConn.collection(colName).find({}).toArray();

      if (documents.length > 0) {
        // Xóa dữ liệu cũ trên cloud nếu có (để tránh bị trùng)
        await cloudConn.collection(colName).deleteMany({});
        // Chèn dữ liệu mới
        await cloudConn.collection(colName).insertMany(documents);
        console.log(`   ✔️  Đã chuyển ${documents.length} bản ghi`);
      } else {
        console.log(`   ⚠️  Collection ${colName} trống, bỏ qua.`);
      }
    }

    console.log('\n=========================================');
    console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN LÊN CLOUD!');
    console.log('=========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ LỖI KHI CHUYỂN DỮ LIỆU:', error.message);
    console.log('\nLƯU Ý: Hãy đảm bảo bạn đã thay "MẬT_KHẨU_CỦA_BẠN" trong file này nhé!');
    process.exit(1);
  }
}

migrate();
