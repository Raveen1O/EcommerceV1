const express = require('express');
const router = express.Router();

const {
    addProduct,
    decreaseProduct,
    getUserCart,
    removeCartItem,
    checkout
} = require('../controllers/cartController');

router.post('/add', addProduct);

router.patch('/decrease', decreaseProduct);

router.get('/user/:userId', getUserCart);

router.delete('/:cartItemId', removeCartItem);

router.post('/checkout/:userId', checkout);

module.exports = router;