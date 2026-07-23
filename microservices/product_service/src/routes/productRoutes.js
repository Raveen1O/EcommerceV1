const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authMiddleware');
const { verifyAdmin } = require('../../middleware/adminMiddleware');
const { verifyService } = require('../../middleware/serviceMiddleware');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

router.post('/',verifyToken,
    verifyAdmin, createProduct);

router.get('/', getProducts);

router.get('/:id', getProductById);

router.put('/:id',
    verifyToken,
    verifyAdmin,
    updateProduct
);

router.delete('/:id',
    verifyService, deleteProduct);

module.exports = router;