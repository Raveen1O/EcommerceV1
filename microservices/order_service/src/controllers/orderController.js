const Order = require('../models/Order');

// CREATE
exports.createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);

        res.status(201).json(order);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// GET ALL
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        res.json(orders);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// GET BY ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.json(order);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// UPDATE
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.json(order);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// DELETE
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.json({
            message: 'Order deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};