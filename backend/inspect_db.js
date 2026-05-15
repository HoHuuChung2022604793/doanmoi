const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

// Override URI to localhost for script execution from host
const uri = 'mongodb://localhost:27017/phone-store';

const inspectData = async () => {
  try {
    console.log(`🔌 Connecting to ${uri}...`);
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    const count = await Product.countDocuments();
    console.log(`📊 Total Products: ${count}`);

    if (count > 0) {
      const examples = await Product.find({}).limit(5);
      console.log('📝 Example Products (Check "images" paths):');
      examples.forEach(p => {
        console.log(`- [${p.name}] Thumbnail: ${p.thumbnail}`);
        console.log(`  Images: ${JSON.stringify(p.images)}`);
      });
      
      // Check for local images specifically
      const localImageCount = await Product.countDocuments({ 
        thumbnail: { $regex: /^\/uploads\// } 
      });
      console.log(`\n🏠 Products with local '/uploads/' paths: ${localImageCount}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

inspectData();
