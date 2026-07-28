const express = require('express');
const router = express.Router();

const {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist
} = require('../controllers/wishlistController');

router.post('/add', addToWishlist);
router.get('/user/:userId', getUserWishlist);
router.delete('/:userId/:productId', removeFromWishlist);

module.exports = router;
