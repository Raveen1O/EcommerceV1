const axios = require('axios');
const Payment = require('../models/Payment');

const {
    SNSClient,
    PublishCommand
} = require('@aws-sdk/client-sns');
const AWSXRay = require('aws-xray-sdk');
console.log('PAYMENT_TOPIC_ARN =', process.env.PAYMENT_TOPIC_ARN);
console.log('AWS_REGION =', process.env.AWS_REGION);
const snsClient = AWSXRay.captureAWSv3Client(new SNSClient({
    region: process.env.AWS_REGION || 'ap-southeast-1'
}));

exports.processPayment = async (req, res) => {

    try {

        console.log('==============================');
        console.log('PAYMENT FUNCTION STARTED');
        console.log('==============================');

        const { orderId, fullName, email, cardNumber, expiry, cvc } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: 'orderId is required'
            });
        }

        if (!fullName || !email || !cardNumber || !expiry || !cvc) {
            return res.status(400).json({
                message: 'Please provide complete payment details'
            });
        }

        const baseUrl = process.env.API_BASE_URL || 'https://jw0yvet0t5.execute-api.ap-southeast-1.amazonaws.com/';

        // GET ORDER

        console.log(
            'Fetching Order:',
            `${baseUrl}api/orders/${orderId}`
        );

        const orderResponse = await axios.get(
            `${baseUrl}api/orders/${orderId}`
        );

        console.log('Order Response:', orderResponse.data);

        const order = orderResponse.data;

        if (order.status !== 'Pending') {
            return res.status(400).json({
                message: 'Order already processed'
            });
        }

        // GET PRODUCT

        console.log(
            'Fetching Product:',
            `${baseUrl}api/products/${order.productId}`
        );

        const productResponse = await axios.get(
            `${baseUrl}api/products/${order.productId}`
        );

        console.log('Product Response:', productResponse.data);

        const product = productResponse.data;

        if (product.stock < order.quantity) {
            return res.status(400).json({
                message: 'Insufficient stock'
            });
        }

        const forwardHeaders = {
            "x-service-secret": process.env.SERVICE_SECRET
        };
        if (req.headers && (req.headers.authorization || req.headers.Authorization)) {
            forwardHeaders.Authorization = req.headers.authorization || req.headers.Authorization;
        }

        // PAYMENT SIMULATION

        const normalizedCard = cardNumber.replace(/\s+/g, '');
        const validTestCard = normalizedCard === '4242424242424242';
        const validCvc = /^[0-9]{3,4}$/.test(cvc);
        const validExpiry = /^[0-9]{2}\/[0-9]{2}$/.test(expiry);

        if (!validTestCard || !validCvc || !validExpiry) {
            return res.status(400).json({
                message: 'Payment failed: use test card 4242 4242 4242 4242 with valid expiry and CVC'
            });
        }

        const paymentSuccessful = true;

        if (!paymentSuccessful) {
            return res.status(400).json({
                message: 'Payment Failed'
            });
        }

        // UPDATE PRODUCT STOCK

        console.log('Before Product Update');

        console.log('After Product Update');

        // UPDATE ORDER STATUS

        console.log('Before Order Update');

        const orderUpdateResponse = await axios.patch(
            `${baseUrl}api/orders/${order._id}`,
            { status: 'Paid' },
            { headers: forwardHeaders }
        );

        console.log('After Order Update:', orderUpdateResponse.data);

        // SAVE PAYMENT

        console.log('Before Payment Create');

        const payment = await Payment.create({
            orderId: order._id,
            amount: order.totalPrice,
            status: 'Success'
        });

        console.log('After Payment Create');

        // CLEAR USER CART

        console.log('Clearing cart for user:', order.userId);

        const cartClearResponse = await axios.delete(
            `${baseUrl}api/cart/user/${order.userId}`,
            { headers: forwardHeaders }
        );

        console.log('Cart clear response:', cartClearResponse.data);

        // SNS PUBLISH

        console.log('Before SNS Publish');
        console.log('Topic ARN:', process.env.PAYMENT_TOPIC_ARN);

        let snsMessageId = null;
        let snsPublished = false;

        try {
            const snsResponse = await snsClient.send(
                new PublishCommand({
                    TopicArn: process.env.PAYMENT_TOPIC_ARN,
                    Subject: 'PaymentSucceeded',
                    Message: JSON.stringify({
                        eventType: 'PaymentSucceeded',
                        orderId: order._id,
                        productId: product._id,
                        quantity: order.quantity,
                        amount: order.totalPrice,
                        paymentId: payment._id,
                        customerEmail: email,
                        customerName: fullName
                    })
                })
            );
            snsMessageId = snsResponse.MessageId;
            snsPublished = true;
            console.log('After SNS Publish');
            console.log('SNS Response:', snsResponse);
        } catch (snsErr) {
            console.error('SNS Publish failed:', snsErr);
            // We do not throw here, so the payment still succeeds even if SNS is misconfigured locally
        }

        return res.status(201).json({
            payment,
            snsPublished,
            messageId: snsMessageId,
            customerEmail: email
        });

    } catch (error) {

        console.error('==============================');
        console.error('PAYMENT ERROR');
        console.error('==============================');

        console.error(error);

        if (error.response) {
            console.error('Axios Status:', error.response.status);
            console.error('Axios Response:', error.response.data);
        }
//test
        return res.status(500).json({
            message: error.message,
            axiosStatus: error.response?.status,
            axiosResponse: error.response?.data,
            stack: error.stack
        });
    }
};

exports.getPayments = async (req, res) => {

    try {

        const payments = await Payment.find();

        res.status(200).json(payments);

    } catch (error) {

        console.error('Get Payments Error:', error);

        res.status(500).json({
            error: error.message
        });
    }
};