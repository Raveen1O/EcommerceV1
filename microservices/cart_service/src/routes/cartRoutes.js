const express = require('express');
const router = express.Router();

const {
    addProduct,
    decreaseProduct,
    getUserCart,
    removeCartItem,
    checkout,
    clearUserCart
} = require('../controllers/cartController');

const { verifyToken } = require('../../middleware/authMiddleware');

// Protected routes: require valid Cognito JWT. Middleware attaches `req.user`.
router.post('/add', verifyToken, addProduct);

router.patch('/decrease', verifyToken, decreaseProduct);

router.get('/user/:userId', verifyToken, getUserCart);

router.delete('/:cartItemId', verifyToken, removeCartItem);

router.post('/checkout/:userId', verifyToken, checkout);
router.delete('/user/:userId', verifyToken, clearUserCart);

module.exports = router;