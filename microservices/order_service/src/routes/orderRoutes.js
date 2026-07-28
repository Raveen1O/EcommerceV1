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
    deleteOrder,
    getOrdersByUser,
    getAnalytics
} = require('../controllers/orderController');

router.post('/', createOrder);

router.get('/', getOrders);

router.get('/analytics', getAnalytics);

router.get('/user/:userId', getOrdersByUser);

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

router.patch('/:id', updateOrder);

module.exports = router;