const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'chung-mobile',
      resource_type: isVideo ? 'video' : 'image',
      format: isVideo ? 'mp4' : undefined, // Cloudinary sẽ tự xử lý định dạng nếu là ảnh
      public_id: 'product-' + Date.now() + '-' + Math.round(Math.random() * 1E9)
    };
  },
});

// Filter cho phép ảnh và video
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, webp) hoặc video (mp4, webm, ogg)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Tăng lên 100MB cho video
  }
});

module.exports = upload;
