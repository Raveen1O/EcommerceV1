const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authMiddleware');
const {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist
} = require('../controllers/wishlistController');

router.post('/add', verifyToken, addToWishlist);
router.get('/user/:userId', verifyToken, getUserWishlist);
router.delete('/:userId/:productId', verifyToken, removeFromWishlist);

module.exports = router;
