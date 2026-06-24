const axios = require('axios');
const Payment = require('../models/Payment');

exports.processPayment = async (req, res) => {

    try {

        const { orderId } = req.body;

        // Get Order

        const orderResponse = await axios.get(
            `http://localhost:5001/api/orders/${orderId}`
        );

        const order = orderResponse.data;

        if(order.status !== 'Pending') {
            return res.status(400).json({
                message: 'Order already processed'
            });
        }

        // Get Product

        const productResponse = await axios.get(
            `http://localhost:5000/api/products/${order.productId}`
        );

        const product = productResponse.data;

        if(product.stock < order.quantity) {
            return res.status(400).json({
                message: 'Insufficient stock'
            });
        }

        // Simulate Payment Success

        const paymentSuccessful = true;

        if(!paymentSuccessful) {
            return res.status(400).json({
                message: 'Payment Failed'
            });
        }

        // Reduce Stock

        await axios.put(
            `http://localhost:5000/api/products/${product._id}`,
            {
                stock: product.stock - order.quantity
            }
        );

        // Update Order Status

        await axios.put(
            `http://localhost:5001/api/orders/${order._id}`,
            {
                status: 'Success'
            }
        );

        // Save Payment

        const payment = await Payment.create({
            orderId: order._id,
            amount: order.totalPrice,
            status: 'Success'
        });

        res.status(201).json(payment);

    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }
};
exports.getPayments = async (req, res) => {

    try {

        const payments = await Payment.find();

        res.json(payments);

    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }
};