const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS to bypass local ISP SRV blocks
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const http = require('http');

const BUCKET_NAME = 'raveen-images';
const REGION = process.env.AWS_REGION || 'ap-southeast-1';

const s3Client = new S3Client({ region: REGION });

async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to download image. Status code: ${res.statusCode}`));
            }
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve({
                buffer: Buffer.concat(data),
                contentType: res.headers['content-type'] || 'image/jpeg'
            }));
        }).on('error', reject);
    });
}

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
        console.log('Using URI:', mongoUri.replace(/:[^:@]+@/, ':****@')); // hide password
        await mongoose.connect(mongoUri, { family: 4 });
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        for (const product of products) {
            let imgUrl = product.imageUrl || product.image;
            
            // Skip if no image or already on S3
            if (!imgUrl) continue;
            if (imgUrl.includes(`s3.${REGION}.amazonaws.com/${BUCKET_NAME}`)) {
                console.log(`Skipping ${product.name}: Already migrated.`);
                continue;
            }

            console.log(`Migrating image for product: ${product.name}`);
            try {
                // Download image
                console.log(`Downloading: ${imgUrl}`);
                const { buffer, contentType } = await downloadImage(imgUrl);
                
                // Upload to S3
                const key = `migrated/${Date.now()}-image.jpg`;
                const command = new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType
                });
                await s3Client.send(command);

                const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
                
                // Update product in MongoDB
                product.imageUrl = publicUrl;
                if (product.image) product.image = undefined; // clean up old field if it exists
                await product.save();
                
                console.log(`Successfully migrated ${product.name} to ${publicUrl}`);
            } catch (err) {
                console.error(`Failed to migrate image for ${product.name}:`, err.message);
            }
        }

        console.log('Migration completed!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
