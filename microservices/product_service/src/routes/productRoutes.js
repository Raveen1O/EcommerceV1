const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authMiddleware');
const { verifyAdmin } = require('../../middleware/adminMiddleware');
const { verifyService } = require('../../middleware/serviceMiddleware');
const {authOrService} = require('../../middleware/authOrService')
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
    authOrService,
    updateProduct
);

router.delete('/:id',
    verifyToken,
    verifyAdmin, deleteProduct);

module.exports = router;