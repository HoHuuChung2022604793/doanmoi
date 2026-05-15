require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Cleared old data');

    // Tạo Admin
    const admin = await User.create({
      email: 'admin@chungmobile.com',
      password: 'admin123',
      name: 'Admin',
      phone: '0123456789',
      role: 'admin'
    });
    console.log('👤 Admin created:', admin.email);

    // Tạo User mẫu
    const user = await User.create({
      email: 'user@example.com',
      password: 'user123',
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      role: 'user'
    });
    console.log('👤 User created:', user.email);

    // Tạo sản phẩm mẫu
    const products = [
      // iPhone 17 Series (New)
      {
        name: 'iPhone 17 Pro Max',
        brand: 'Apple',
        price: 36990000,
        originalPrice: 38990000,
        description: 'iPhone 17 Pro Max - Đỉnh cao công nghệ tương lai. Chip A19 Pro siêu mạnh, thiết kế Titanium thế hệ mới.',
        specs: { screen: '6.9 inch Super Retina XDR', cpu: 'A19 Pro', ram: '12GB', storage: '256GB', battery: '4800mAh', camera: '48MP + 48MP + 48MP', os: 'iOS 18' },
        images: [],
        thumbnail: '',
        stock: 50,
        isFeatured: true,
        colors: ['Titan Desert', 'Titan Black', 'Titan White']
      },
      {
        name: 'iPhone 17',
        brand: 'Apple',
        price: 26990000,
        description: 'iPhone 17 - Cân bằng hoàn hảo. Chip A19, màn hình 120Hz ProMotion đầu tiên trên dòng thường.',
        specs: { screen: '6.3 inch Super Retina XDR', cpu: 'A19', ram: '8GB', storage: '128GB', battery: '3800mAh', camera: '48MP + 12MP', os: 'iOS 18' },
        images: [],
        thumbnail: '',
        stock: 60,
        colors: ['Hồng', 'Xanh', 'Vàng', 'Đen']
      },

      {
        name: 'iPhone 14 Pro Max',
        brand: 'Apple',
        price: 27990000,
        originalPrice: 29990000,
        description: 'iPhone 14 Pro Max - Màn hình Dynamic Island đột phá, camera 48MP đẳng cấp.',
        specs: { screen: '6.7 inch Super Retina XDR', cpu: 'A16 Bionic', ram: '6GB', storage: '128GB', battery: '4323mAh', camera: '48MP + 12MP + 12MP', os: 'iOS 16' },
        images: [],
        thumbnail: '',
        stock: 50,
        isFeatured: true,
        colors: ['Tím', 'Đen', 'Vàng', 'Bạc']
      },

      // iPhone 15 Series
      {
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        price: 34990000,
        originalPrice: 36990000,
        description: 'iPhone 15 Pro Max - Thiết kế Titan bền bỉ, chip A17 Pro game thủ, Camera 48MP zoom quang 5x.',
        specs: { screen: '6.7 inch Super Retina XDR', cpu: 'A17 Pro', ram: '8GB', storage: '256GB', battery: '4422mAh', camera: '48MP + 12MP + 12MP', os: 'iOS 17' },
        images: [],
        thumbnail: '',
        stock: 50,
        isFeatured: true,
        colors: ['Titan Tự Nhiên', 'Titan Xanh', 'Titan Đen', 'Titan Trắng']
      },
      {
        name: 'iPhone 15 Plus',
        brand: 'Apple',
        price: 25990000,
        description: 'iPhone 15 Plus - Màn hình lớn 6.7 inch, Dynamic Island, Pin siêu trâu cả ngày.',
        specs: { screen: '6.7 inch Super Retina XDR', cpu: 'A16 Bionic', ram: '6GB', storage: '128GB', battery: '4383mAh', camera: '48MP + 12MP', os: 'iOS 17' },
        images: [],
        thumbnail: '',
        stock: 45,
        colors: ['Hồng', 'Vàng', 'Xanh Lá', 'Đen']
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        price: 33990000,
        originalPrice: 35990000,
        description: 'Samsung Galaxy S24 Ultra với bút S Pen, camera 200MP, Galaxy AI.',
        specs: { screen: '6.8 inch Dynamic AMOLED 2X', cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', battery: '5000mAh', camera: '200MP + 12MP + 50MP + 10MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 40,
        isFeatured: true,
        colors: ['Titan Gray', 'Titan Black', 'Titan Violet', 'Titan Yellow']
      },
      {
        name: 'Xiaomi 14 Ultra',
        brand: 'Xiaomi',
        price: 23990000,
        description: 'Xiaomi 14 Ultra với camera Leica, Snapdragon 8 Gen 3.',
        specs: { screen: '6.73 inch AMOLED', cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB', battery: '5000mAh', camera: '50MP + 50MP + 50MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 30,
        isFeatured: true,
        colors: ['Đen', 'Trắng']
      },
      {
        name: 'OPPO Find X7 Ultra',
        brand: 'OPPO',
        price: 22990000,
        description: 'OPPO Find X7 Ultra với camera kép periscope, Hasselblad.',
        specs: { screen: '6.82 inch AMOLED', cpu: 'Dimensity 9300', ram: '16GB', storage: '512GB', battery: '5000mAh', camera: '50MP + 50MP + 50MP + 50MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 25,
        colors: ['Ocean Blue', 'Sepia Brown']
      },
      {
        name: 'iPhone 14',
        brand: 'Apple',
        price: 16990000,
        description: 'iPhone 14 - Thiết kế bền bỉ, camera quay phim chế độ Action Mode siêu ổn định.',
        specs: { screen: '6.1 inch Super Retina XDR', cpu: 'A15 Bionic', ram: '6GB', storage: '128GB', battery: '3279mAh', camera: '12MP + 12MP', os: 'iOS 16' },
        images: [],
        thumbnail: '',
        stock: 60,
        colors: ['Tím', 'Xanh dương', 'Đỏ', 'Trắng', 'Đen']
      },

      // iPad Series
      {
        name: 'iPad Pro M2 12.9 inch WiFi 5G',
        brand: 'Apple',
        price: 34990000,
        description: 'iPad Pro M2 - Hiệu năng đỉnh cao với chip M2, màn hình Mini-LED XDR chân thực.',
        specs: { screen: '12.9 inch Liquid Retina XDR', cpu: 'Apple M2', ram: '8GB', storage: '128GB', battery: '10758mAh', camera: '12MP + 10MP + LiDAR', os: 'iPadOS 16' },
        images: [],
        thumbnail: '',
        stock: 20,
        category: 'Tablet',
        isFeatured: true,
        colors: ['Xám Không Gian', 'Bạc']
      },
      {
        name: 'iPad Air 5 M1 WiFi',
        brand: 'Apple',
        price: 15490000,
        description: 'iPad Air 5 M1 - Sức mạnh chip M1 trong thiết kế mỏng nhẹ đầy màu sắc.',
        specs: { screen: '10.9 inch Liquid Retina', cpu: 'Apple M1', ram: '8GB', storage: '64GB', battery: '28.6 Wh', camera: '12MP', os: 'iPadOS 16' },
        images: [],
        thumbnail: '',
        stock: 35,
        category: 'Tablet',
        colors: ['Xanh Dương', 'Tím', 'Xám', 'Hồng', 'Trắng']
      },
      {
        name: 'iPad Gen 10 WiFi',
        brand: 'Apple',
        price: 9990000,
        description: 'iPad Gen 10 - Thiết kế mới toàn diện, màn hình Liquid Retina 10.9 inch sắc nét.',
        specs: { screen: '10.9 inch Liquid Retina', cpu: 'A14 Bionic', ram: '4GB', storage: '64GB', battery: '28.6 Wh', camera: '12MP', os: 'iPadOS 16' },
        images: [],
        thumbnail: '',
        stock: 50,
        category: 'Tablet',
        colors: ['Vàng', 'Xanh dương', 'Hồng', 'Bạc']
      },
      {
        name: 'Samsung Galaxy A55 5G',
        brand: 'Samsung',
        price: 10490000,
        description: 'Samsung Galaxy A55 5G với thiết kế cao cấp, camera OIS 50MP.',
        specs: { screen: '6.6 inch Super AMOLED', cpu: 'Exynos 1480', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 12MP + 5MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 80,
        colors: ['Xanh Navy', 'Tím Lilac', 'Vàng Chanh', 'Xanh Đá']
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro+',
        brand: 'Xiaomi',
        price: 8990000,
        description: 'Redmi Note 13 Pro+ với camera 200MP, sạc nhanh 120W.',
        specs: { screen: '6.67 inch AMOLED', cpu: 'Dimensity 7200 Ultra', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '200MP + 8MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 100,
        colors: ['Đen', 'Trắng', 'Tím']
      },
      {
        name: 'OPPO Reno11 5G',
        brand: 'OPPO',
        price: 10990000,
        description: 'OPPO Reno11 5G với camera chân dung đẹp, thiết kế mỏng nhẹ.',
        specs: { screen: '6.7 inch AMOLED', cpu: 'Dimensity 7050', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '50MP + 32MP + 8MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 45,
        colors: ['Xám', 'Xanh']
      },

      {
        name: 'Vivo X100 Pro 5G',
        brand: 'Vivo',
        price: 24990000,
        description: 'Vivo X100 Pro đỉnh cao nhiếp ảnh ZEISS, chip Dimensity 9300 mạnh mẽ.',
        specs: { screen: '6.78 inch AMOLED', cpu: 'Dimensity 9300', ram: '16GB', storage: '512GB', battery: '5400mAh', camera: '50MP + 50MP + 50MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 20,
        colors: ['Đen Asteroid', 'Trắng Moonlight']
      },
      {
        name: 'Realme 12 Pro+ 5G',
        brand: 'Realme',
        price: 9490000,
        description: 'Realme 12 Pro+ thiết kế Rolex cao cấp, camera tele periscope chụp chân dung chuẩn điện ảnh.',
        specs: { screen: '6.7 inch AMOLED', cpu: 'Snapdragon 7s Gen 2', ram: '12GB', storage: '256GB', battery: '5000mAh', camera: '50MP + 64MP + 8MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 45,
        colors: ['Đỏ', 'Xanh']
      },
      {
        name: 'Vivo V30e',
        brand: 'Vivo',
        price: 9490000,
        description: 'Vivo V30e thiết kế hào quang, camera Sony IMX882, pin khủng 5500mAh.',
        specs: { screen: '6.78 inch AMOLED', cpu: 'Snapdragon 6 Gen 1', ram: '8GB', storage: '256GB', battery: '5500mAh', camera: '50MP + 8MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 50,
        colors: ['Tím', 'Trắng']
      },
      {
        name: 'Realme C65',
        brand: 'Realme',
        price: 4790000,
        description: 'Realme C65 thiết kế vân ánh sao, sạc nhanh 45W, đạt chứng nhận độ mượt 48 tháng.',
        specs: { screen: '6.67 inch IPS LCD', cpu: 'Helio G85', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '50MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 100,
        colors: ['Tím Tinh Vân', 'Đen Ngân Hà']
      },

      // --- SẢN PHẨM MỚI BỔ SUNG ---
      // Samsung
      {
        name: 'Samsung Galaxy A35 5G',
        brand: 'Samsung',
        price: 8290000,
        description: 'Galaxy A35 5G - Thiết kế Key Island độc đáo, lưng kính cao cấp, camera 50MP.',
        specs: { screen: '6.6 inch Super AMOLED', cpu: 'Exynos 1380', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 8MP + 5MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 65,
        colors: ['Xanh Ice', 'Vàng Lemon', 'Tím Lilac']
      },
      {
        name: 'Samsung Galaxy M55 5G',
        brand: 'Samsung',
        price: 9690000,
        description: 'Galaxy M55 5G - Pin mãnh thú, sạc nhanh 45W, chip Snapdragon 7 Gen 1.',
        specs: { screen: '6.7 inch Super AMOLED+', cpu: 'Snapdragon 7 Gen 1', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '50MP + 8MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 55,
        colors: ['Xanh Mint', 'Đen']
      },
      {
        name: 'Samsung Galaxy S23 FE 5G',
        brand: 'Samsung',
        price: 11890000,
        description: 'Galaxy S23 FE - Phiên bản Fan Edition, trải nghiệm flagship với mức giá tốt.',
        specs: { screen: '6.4 inch Dynamic AMOLED 2X', cpu: 'Exynos 2200', ram: '8GB', storage: '128GB', battery: '4500mAh', camera: '50MP + 12MP + 8MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 40,
        colors: ['Xanh Mint', 'Tím', 'Kem', 'Xám']
      },

      // Xiaomi
      {
        name: 'Xiaomi 13T 5G',
        brand: 'Xiaomi',
        price: 11490000,
        description: 'Xiaomi 13T - Camera Leica chuyên nghiệp, màn hình CrystalRes 144Hz.',
        specs: { screen: '6.67 inch AMOLED', cpu: 'Dimensity 8200 Ultra', ram: '12GB', storage: '256GB', battery: '5000mAh', camera: '50MP + 50MP + 12MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 30,
        colors: ['Xanh Dương', 'Xanh Lá', 'Đen']
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro (4G)',
        brand: 'Xiaomi',
        price: 6490000,
        description: 'Redmi Note 13 Pro - Camera 200MP OIS, sạc nhanh 67W.',
        specs: { screen: '6.67 inch AMOLED', cpu: 'Helio G99 Ultra', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '200MP + 8MP + 2MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 70,
        colors: ['Xanh', 'Tím', 'Đen']
      },
      {
        name: 'POCO X6 Pro 5G',
        brand: 'Xiaomi',
        price: 8490000,
        description: 'POCO X6 Pro - Hiệu năng vô đối với Dimensity 8300 Ultra, chuyên game.',
        specs: { screen: '6.67 inch AMOLED', cpu: 'Dimensity 8300 Ultra', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '64MP + 8MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 45,
        colors: ['Xám', 'Vàng', 'Đen']
      },

      // OPPO
      {
        name: 'OPPO A79 5G',
        brand: 'OPPO',
        price: 7490000,
        description: 'OPPO A79 5G - Thiết kế lông vũ độc đáo, màn hình lớn 90Hz.',
        specs: { screen: '6.72 inch LTPS LCD', cpu: 'Dimensity 6020', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '50MP + 2MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 50,
        colors: ['Tím', 'Đen']
      },
      {
        name: 'OPPO A18',
        brand: 'OPPO',
        price: 3290000,
        description: 'OPPO A18 - Thiết kế OPPO Glow, pin lớn 5000mAh.',
        specs: { screen: '6.56 inch IPS LCD', cpu: 'Helio G85', ram: '4GB', storage: '128GB', battery: '5000mAh', camera: '8MP + 2MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 100,
        colors: ['Xanh', 'Đen']
      },

      // Vivo
      {
        name: 'Vivo Y36',
        brand: 'Vivo',
        price: 5290000,
        description: 'Vivo Y36 - Thiết kế mặt lưng kính, sạc siêu tốc 44W.',
        specs: { screen: '6.64 inch IPS LCD', cpu: 'Snapdragon 680', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 2MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 60,
        colors: ['Xanh Sóng Biển', 'Đen Sao Băng']
      },
      {
        name: 'Vivo Y03',
        brand: 'Vivo',
        price: 2990000,
        description: 'Vivo Y03 - Giá rẻ, thiết kế thời trang, kháng nước IP54.',
        specs: { screen: '6.56 inch IPS LCD', cpu: 'Helio G85', ram: '4GB', storage: '64GB', battery: '5000mAh', camera: '13MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 80,
        colors: ['Xanh', 'Đen']
      },

      // Realme
      {
        name: 'Realme C53',
        brand: 'Realme',
        price: 3790000,
        description: 'Realme C53 - Sạc 33W, camera 50MP, thiết kế ánh kim.',
        specs: { screen: '6.74 inch IPS LCD', cpu: 'Unisoc Tiger T612', ram: '6GB', storage: '128GB', battery: '5000mAh', camera: '50MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 75,
        colors: ['Vàng', 'Đen']
      },
      {
        name: 'Realme 11 Pro 5G',
        brand: 'Realme',
        price: 8490000,
        description: 'Realme 11 Pro - Thiết kế da sinh học, màn hình cong 120Hz.',
        specs: { screen: '6.7 inch AMOLED', cpu: 'Dimensity 7050', ram: '8GB', storage: '256GB', battery: '5000mAh', camera: '100MP + 2MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 30,
        colors: ['Trắng', 'Xanh']
      },
      {
        name: 'Samsung Galaxy Z Fold6',
        brand: 'Samsung',
        price: 41990000,
        description: 'Galaxy Z Fold6 - Quyền năng AI, Gập mở bứt phá.',
        specs: { screen: '7.6 inch Dynamic AMOLED 2X', cpu: 'Snapdragon 8 Gen 3 for Galaxy', ram: '12GB', storage: '256GB', battery: '4400mAh', camera: '50MP + 12MP + 10MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 15,
        isFeatured: true,
        colors: ['Xám Metal', 'Hồng', 'Xanh Navy']
      },
      {
        name: 'Samsung Galaxy Z Flip6',
        brand: 'Samsung',
        price: 26990000,
        description: 'Galaxy Z Flip6 - Biểu tượng thời trang, Camera 50MP.',
        specs: { screen: '6.7 inch Dynamic AMOLED 2X', cpu: 'Snapdragon 8 Gen 3 for Galaxy', ram: '12GB', storage: '256GB', battery: '4000mAh', camera: '50MP + 12MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 20,
        isFeatured: true,
        colors: ['Xanh Maya', 'Vàng Solar', 'Xanh Mint']
      },

      // --- SẢN PHẨM MỚI PHASE 2 (Pixel, Gaming Phone) ---
      // Google Pixel
      {
        name: 'Google Pixel 8 Pro',
        brand: 'Google',
        price: 22990000,
        description: 'Google Pixel 8 Pro - Nhiếp ảnh AI đỉnh cao, màn hình Super Actua sáng nhất.',
        specs: { screen: '6.7 inch LTPO OLED', cpu: 'Google Tensor G3', ram: '12GB', storage: '128GB', battery: '5050mAh', camera: '50MP + 48MP + 48MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 30,
        category: 'Phone',
        colors: ['Xanh Bay', 'Đen Obsidian', 'Trắng Porcelain']
      },
      {
        name: 'Google Pixel 7a',
        brand: 'Google',
        price: 10990000,
        description: 'Google Pixel 7a - Nhỏ gọn, camera xuất sắc trong tầm giá, chip Tensor G2.',
        specs: { screen: '6.1 inch OLED', cpu: 'Google Tensor G2', ram: '8GB', storage: '128GB', battery: '4385mAh', camera: '64MP + 13MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 40,
        category: 'Phone',
        colors: ['Xanh Biển', 'Đen Than', 'Trắng Tuyết']
      },

      // Gaming Phone
      {
        name: 'ASUS ROG Phone 8 Pro',
        brand: 'ASUS',
        price: 29990000,
        description: 'ROG Phone 8 Pro - Quái vật Gaming, màn hình AniMe Vision độc đáo, Snapdragon 8 Gen 3.',
        specs: { screen: '6.78 inch AMOLED 165Hz', cpu: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB', battery: '5500mAh', camera: '50MP + 32MP + 13MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 15,
        category: 'Phone',
        isFeatured: true,
        colors: ['Đen Phantom']
      },
      {
        name: 'Nubia Red Magic 9 Pro',
        brand: 'Nubia',
        price: 19990000,
        description: 'Red Magic 9 Pro - Thiết kế phẳng hoàn toàn, quạt tản nhiệt RGB tích hợp.',
        specs: { screen: '6.8 inch AMOLED 120Hz', cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', battery: '6500mAh', camera: '50MP + 50MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 20,
        category: 'Phone',
        colors: ['Bạc Cyclone', 'Đen Sleet']
      },

      // Samsung Giá Rẻ
      {
        name: 'Samsung Galaxy A15',
        brand: 'Samsung',
        price: 4990000,
        description: 'Galaxy A15 - Màn hình Super AMOLED 90Hz rực rỡ, thiết kế Key Island.',
        specs: { screen: '6.5 inch Super AMOLED', cpu: 'Helio G99', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 5MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 100,
        category: 'Phone',
        colors: ['Vàng', 'Xanh Dương', 'Xanh Đen']
      },
      {
        name: 'Samsung Galaxy A25 5G',
        brand: 'Samsung',
        price: 6590000,
        description: 'Galaxy A25 5G - Trải nghiệm 5G tốc độ cao, camera OIS chống rung.',
        specs: { screen: '6.5 inch Super AMOLED 120Hz', cpu: 'Exynos 1280', ram: '6GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 8MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 80,
        category: 'Phone',
        colors: ['Vàng', 'Xanh Dương', 'Đen']
      },

      // Xiaomi & OPPO Bổ Sung
      {
        name: 'Xiaomi 14 5G',
        brand: 'Xiaomi',
        price: 19990000,
        description: 'Xiaomi 14 - Kích thước nhỏ gọn, sức mạnh vô song với ống kính Leica Summilux.',
        specs: { screen: '6.36 inch AMOLED 120Hz', cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', battery: '4610mAh', camera: '50MP + 50MP + 50MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 25,
        category: 'Phone',
        isFeatured: true,
        colors: ['Trắng', 'Đen', 'Xanh Ngọc Bích']
      },
      {
        name: 'OPPO Reno10 5G',
        brand: 'OPPO',
        price: 9990000,
        description: 'OPPO Reno10 5G - Chuyên gia chân dung với camera tele 32MP.',
        specs: { screen: '6.7 inch AMOLED 120Hz', cpu: 'Dimensity 7050', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '64MP + 32MP + 8MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 45,
        category: 'Phone',
        colors: ['Xanh Băng Tuyết', 'Xám Ánh Trăng']
      },

      // iPhone cũ (giá tốt)
      {
        name: 'iPhone 13',
        brand: 'Apple',
        price: 13990000,
        description: 'iPhone 13 - Chip A15 Bionic mạnh mẽ, camera kép tiên tiến.',
        specs: { screen: '6.1 inch Super Retina XDR', cpu: 'Apple A15 Bionic', ram: '4GB', storage: '128GB', battery: '3240mAh', camera: '12MP + 12MP', os: 'iOS 15' },
        images: [],
        thumbnail: '',
        stock: 50,
        colors: ['Xanh lá', 'Hồng', 'Trắng', 'Đen']
      },
      {
        name: 'iPhone 11',
        brand: 'Apple',
        price: 8990000,
        description: 'iPhone 11 - Thiết kế đầy màu sắc, camera góc siêu rộng.',
        specs: { screen: '6.1 inch Liquid Retina', cpu: 'Apple A13 Bionic', ram: '4GB', storage: '64GB', battery: '3110mAh', camera: '12MP + 12MP', os: 'iOS 15' },
        images: [],
        thumbnail: '',
        stock: 30,
        colors: ['Trắng', 'Đen']
      },
      {
        name: 'iPhone 8 Plus',
        brand: 'Apple',
        price: 4990000,
        description: 'iPhone 8 Plus - Thiết kế cổ điển với nút Home, camera kép.',
        specs: { screen: '5.5 inch Retina IPS', cpu: 'Apple A11 Bionic', ram: '3GB', storage: '64GB', battery: '2691mAh', camera: '12MP + 12MP', os: 'iOS 11' },
        images: [],
        thumbnail: '',
        stock: 15,
        colors: ['Vàng', 'Bạc', 'Xám', 'Đỏ']
      },
      {
        name: 'Xiaomi Redmi Note 13',
        brand: 'Xiaomi',
        price: 4890000,
        description: 'Redmi Note 13 - Camera 108MP siêu nét, màn hình AMOLED 120Hz.',
        specs: { screen: '6.67 inch AMOLED', cpu: 'Snapdragon 685', ram: '6GB', storage: '128GB', battery: '5000mAh', camera: '108MP + 8MP + 2MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 100,
        colors: ['Vàng', 'Đen', 'Xanh']
      },
      {
        name: 'OPPO A60',
        brand: 'OPPO',
        price: 5490000,
        description: 'OPPO A60 - Siêu bền chuẩn quân đội, sạc nhanh 45W.',
        specs: { screen: '6.67 inch IPS LCD', cpu: 'Snapdragon 680', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 60,
        colors: ['Xanh', 'Đen']
      },
      {
        name: 'Vivo Y100',
        brand: 'Vivo',
        price: 7290000,
        description: 'Vivo Y100 - Thiết kế mặt lưng da, sạc siêu nhanh 80W.',
        specs: { screen: '6.67 inch AMOLED', cpu: 'Snapdragon 685', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP + 2MP', os: 'Android 14' },
        images: [],
        thumbnail: '',
        stock: 40,
        colors: ['Xanh', 'Tím']
      },
      {
        name: 'Realme C60',
        brand: 'Realme',
        price: 2690000,
        description: 'Realme Note 50 - Giá rẻ, màn hình lớn 90Hz.',
        specs: { screen: '6.74 inch IPS LCD', cpu: 'Unisoc Tiger T612', ram: '4GB', storage: '64GB', battery: '5000mAh', camera: '13MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 80,
        colors: ['Xanh', 'Đen']
      },

      // --- SẢN PHẨM MỚI (User Request) ---
      {
        name: 'Sony Xperia 1 V',
        brand: 'Sony',
        price: 29990000,
        description: 'Sony Xperia 1 V - Cảm biến Exmor T mới, màn hình 4K OLED tỉ lệ 21:9 chuẩn điện ảnh.',
        specs: { screen: '6.5 inch 4K OLED', cpu: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB', battery: '5000mAh', camera: '48MP + 12MP + 12MP', os: 'Android 13' },
        images: [],
        thumbnail: '',
        stock: 10,
        category: 'Phone',
        colors: ['Đen', 'Bạc', 'Xanh Khaki']
      }
    ];

    // --- PHẦN TỰ ĐỘNG CẬP NHẬT ẢNH LOCAL CHO SẢN PHẨM ---
    // Thay thế ảnh online bằng ảnh có sẵn trong uploads/products
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, 'uploads/products');

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir).filter(f => !f.startsWith('.'));
      
      if (files.length > 0) {
        console.log(`\n📂 Tìm thấy ${files.length} ảnh trong máy. Đang cập nhật vào danh sách sản phẩm...`);
        
        let fileIdx = 0;
        
        // Duyệt qua từng sản phẩm gốc và gán ảnh local
        for (let i = 0; i < products.length; i++) {
            const currentImages = [];
            // Mỗi sản phẩm lấy ngẫu nhiên 2-3 ảnh
            const numImages = Math.floor(Math.random() * 2) + 2; 

            for (let j = 0; j < numImages; j++) {
                if (fileIdx < files.length) {
                    currentImages.push(`/uploads/products/${files[fileIdx]}`);
                    fileIdx++;
                } else {
                    // Nếu hết ảnh thì quay lại từ đầu (để đảm bảo ko bị thiếu)
                    fileIdx = 0;
                    currentImages.push(`/uploads/products/${files[fileIdx]}`);
                    fileIdx++;
                }
            }

            products[i].images = currentImages;
            products[i].thumbnail = currentImages[0];
        }
        console.log(`✅ Đã gán ảnh local cho ${products.length} sản phẩm.`);
      }
    }
    // -------------------------------------------------------------

    await Product.insertMany(products);
    console.log(`📱 Tổng cộng: ${products.length} sản phẩm đã được tạo.`);

    console.log('\n✅ Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
