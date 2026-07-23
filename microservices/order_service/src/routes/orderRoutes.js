const express = require('express');
const { verifyToken } = require('../../middleware/authMiddleware');
const { verifyAdmin } = require('../../middleware/adminMiddleware');
const { verifyService } = require('../../middleware/serviceMiddleware');
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

router.post('/', createOrder);

router.get('/', getOrders);

router.get('/:id', getOrderById);

router.put('/:id',
    verifyService,
    updateOrder
);

router.put('/:id',
    verifyToken,
    verifyAdmin,
    updateOrder
);

module.exports = router;