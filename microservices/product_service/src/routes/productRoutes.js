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
    deleteProduct,
    getUploadUrl
} = require('../controllers/productController');

router.post('/',verifyToken,
    verifyAdmin, createProduct);

router.get('/', getProducts);

router.get('/upload-url', verifyToken, verifyAdmin, getUploadUrl);

router.get('/:id', getProductById);

router.put('/:id',
    authOrService,
    updateProduct
);

router.delete('/:id',
    verifyToken,
    verifyAdmin, deleteProduct);

module.exports = router;