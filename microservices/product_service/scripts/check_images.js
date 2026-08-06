const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8']); 
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const https = require('https');

async function checkImages() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(mongoUri, { family: 4 });
        const products = await Product.find({}).limit(5);
        
        for (const product of products) {
            console.log(`\nProduct: ${product.name}`);
            console.log(`URL: ${product.imageUrl}`);
            
            if (product.imageUrl && product.imageUrl.startsWith('https://raveen-images.s3')) {
                // Try to do a HEAD request to see what S3 says
                await new Promise((resolve) => {
                    const req = https.request(product.imageUrl, { method: 'HEAD' }, (res) => {
                        console.log(`HTTP Status: ${res.statusCode}`);
                        resolve();
                    });
                    req.on('error', (e) => {
                        console.log(`Request error: ${e.message}`);
                        resolve();
                    });
                    req.end();
                });
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkImages();
