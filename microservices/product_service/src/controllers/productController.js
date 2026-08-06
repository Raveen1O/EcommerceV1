const Product = require('../models/Product');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Helper to sign S3 URLs on the fly
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-1' });

const signProductImage = async (product) => {
    const productObj = product.toObject ? product.toObject() : product;
    if (productObj.imageUrl && productObj.imageUrl.includes('raveen-images.s3')) {
        try {
            // Extract the S3 Key from the URL
            const urlObj = new URL(productObj.imageUrl);
            const key = urlObj.pathname.substring(1); // remove leading slash
            
            const command = new GetObjectCommand({
                Bucket: 'raveen-images',
                Key: key
            });
            
            // Sign URL valid for 1 hour
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            productObj.imageUrl = signedUrl;
        } catch (e) {
            console.error('Failed to sign URL:', e);
        }
    }
    return productObj;
};

console.log(process.env.MONGODB_URI, 'MONGODB_URI');
// CREATE
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        const signedProduct = await signProductImage(product);
        res.status(201).json(signedProduct);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// GET ALL
exports.getProducts = async (req, res) => {
    try {
        const { search, category, sort, page, limit } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else if (sort === 'newest') sortOption._id = -1;
        else if (sort === 'alpha-asc') sortOption.name = 1;
        else if (sort === 'alpha-desc') sortOption.name = -1;

        const productsQuery = Product.find(query);
        if (Object.keys(sortOption).length > 0) {
            productsQuery.sort(sortOption);
        }
        
        if (page && limit) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            productsQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
            
            const products = await productsQuery;
            const total = await Product.countDocuments(query);
            
            const signedProducts = await Promise.all(products.map(signProductImage));
            
            return res.json({
                products: signedProducts,
                hasMore: (pageNum * limitNum) < total
            });
        } else {
            const products = await productsQuery;
            const signedProducts = await Promise.all(products.map(signProductImage));
            return res.json(signedProducts);
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// GET BY ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const signedProduct = await signProductImage(product);
        res.json(signedProduct);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// UPDATE
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const signedProduct = await signProductImage(product);
        res.json(signedProduct);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// DELETE
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.json({
            message: 'Product deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// GET PRESIGNED UPLOAD URL
exports.getUploadUrl = async (req, res) => {
    try {
        const { filename, contentType } = req.query;
        if (!filename || !contentType) {
            return res.status(400).json({ message: 'filename and contentType are required' });
        }

        // Clean filename and ensure uniqueness
        const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `products/${Date.now()}-${cleanFilename}`;
        
        const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-1' });
        const command = new PutObjectCommand({
            Bucket: 'raveen-images',
            Key: key,
            ContentType: contentType
        });

        // URL expires in 15 minutes
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
        const publicUrl = `https://raveen-images.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${key}`;

        res.json({
            uploadUrl,
            publicUrl
        });

    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        res.status(500).json({ error: error.message });
    }
};