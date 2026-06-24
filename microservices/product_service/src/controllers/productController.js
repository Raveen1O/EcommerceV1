const Product = require('../models/Product');

// CREATE
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// GET ALL
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.json(products);
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

        res.json(product);

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

        res.json(product);

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