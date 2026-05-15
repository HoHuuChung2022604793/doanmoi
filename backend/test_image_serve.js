const http = require('http');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads/products');
let testFile = '';

if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    if (files.length > 0) testFile = files[0];
}

if (!testFile) {
    console.log('❌ No images found in uploads/products to test.');
    process.exit(1);
}

const url = `http://localhost:5001/uploads/products/${testFile}`;
console.log(`Testing URL: ${url}`);

http.get(url, (res) => {
    console.log(`HTTP Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('✅ Image served successfully!');
    } else {
        console.log('❌ Failed to serve image.');
    }
}).on('error', (e) => {
    console.error(`❌ Connection error: ${e.message}`);
});
