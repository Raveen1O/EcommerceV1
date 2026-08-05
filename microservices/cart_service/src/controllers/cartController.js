const axios = require('axios');
const Cart = require('../models/Cart');

// Add Item
exports.addToCart = async (req, res) => {

    try {

        // If middleware attached user, prefer Cognito sub as userId
        if(req.user && req.user.sub) req.body.userId = req.user.sub;
        const cartItem = await Cart.create(req.body);

        res.status(201).json(cartItem);

    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }
};

// Get Cart
exports.getCartItems = async (req, res) => {

    try {

        const items = await Cart.find();

        res.json(items);

    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }
};

// Get By Id
exports.getCartItemById = async (req, res) => {

    try {

        const item = await Cart.findById(req.params.id);

        if(!item) {

            return res.status(404).json({
                message: 'Cart item not found'
            });
        }

        res.json(item);

    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }
};

// Update Quantity
exports.updateCartItem = async (req, res) => {

    try {

        const item = await Cart.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        if(!item) {

            return res.status(404).json({
                message: 'Cart item not found'
            });
        }

        res.json(item);

    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }
};

// Remove Item
exports.removeCartItem = async (req, res) => {

    try {

        const item = await Cart.findById(req.params.cartItemId);
        if(!item){
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // only owner may delete
        if(req.user && req.user.sub && item.userId !== req.user.sub){
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Cart.findByIdAndDelete(req.params.cartItemId);

        try {
            const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
            const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
            await cwClient.send(new PutMetricDataCommand({
                Namespace: 'Lumina/BusinessMetrics',
                MetricData: [{
                    MetricName: 'CartAbandonmentRate',
                    Value: 100,
                    Dimensions: [{ Name: 'FunctionName', Value: 'raveen-cart_service' }]
                }]
            }));
        } catch(e) { console.error('CW Error', e); }

        res.json({ message: 'Item removed successfully' });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.clearUserCart = async (req, res) => {
    try {
        const userId = (req.user && req.user.sub) || req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (req.user && req.user.sub && userId !== req.user.sub) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Cart.deleteMany({ userId });

        try {
            const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
            const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
            await cwClient.send(new PutMetricDataCommand({
                Namespace: 'Lumina/BusinessMetrics',
                MetricData: [{
                    MetricName: 'CartAbandonmentRate',
                    Value: 100,
                    Dimensions: [{ Name: 'FunctionName', Value: 'raveen-cart_service' }]
                }]
            }));
        } catch(e) { console.error('CW Error', e); }

        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.checkout = async (req, res) => {

    try {

        console.log("========== CHECKOUT STARTED ==========");

        // Prefer authenticated user id (Cognito sub) if available
        const userId = (req.user && req.user.sub) || req.params.userId;

        console.log("User ID:", userId);

        const cartItems = await Cart.find({ userId });

        console.log("Cart Items:", JSON.stringify(cartItems));

        if (cartItems.length === 0) {

            return res.status(400).json({
                message: "Cart is empty"
            });

        }

        let totalPrice = 0;

        // include incoming auth header when calling downstream services
        const forwardHeaders = {
            "x-service-secret": process.env.SERVICE_SECRET
        };
        if(req.headers && (req.headers.authorization || req.headers.Authorization)){
            forwardHeaders.Authorization = req.headers.authorization || req.headers.Authorization;
        }

        for (const item of cartItems) {

            const productUrl =
                `${process.env.API_BASE_URL}api/products/${item.productId}`;

            console.log("Fetching Product:", productUrl);

            const productResponse = await axios.get(productUrl, { headers: forwardHeaders });

            console.log("Product Response:", productResponse.data);

            const product = productResponse.data;

            totalPrice += product.price * item.quantity;
        }

        console.log("Calculated Total:", totalPrice);

        const firstItem = cartItems[0];

        const orderUrl =
            `${process.env.API_BASE_URL}api/orders`;

        console.log("Creating Order at:", orderUrl);

        console.log("Order Payload:", {
            productId: firstItem.productId,
            quantity: firstItem.quantity,
            totalPrice,
            status: "Pending",
            userId
        });

        const orderResponse = await axios.post(
            orderUrl,
            {
                productId: firstItem.productId,
                quantity: firstItem.quantity,
                totalPrice,
                status: "Pending",
                userId
            },
            { headers: forwardHeaders }
        );

        console.log("Order Created:", orderResponse.data);

        try {
            const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
            const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
            await cwClient.send(new PutMetricDataCommand({
                Namespace: 'Lumina/BusinessMetrics',
                MetricData: [{
                    MetricName: 'CartAbandonmentRate',
                    Value: 0,
                    Dimensions: [{ Name: 'FunctionName', Value: 'raveen-cart_service' }]
                }]
            }));
        } catch(e) { console.error('CW Error', e); }

        return res.status(201).json({
            message: "Checkout successful",
            order: orderResponse.data
        });

    } catch (error) {

        console.error("========== CHECKOUT FAILED ==========");

        console.error("Error Message:", error.message);

        console.error("Request URL:", error.config?.url);

        console.error("Request Method:", error.config?.method);

        console.error("Request Body:", error.config?.data);

        console.error("Axios Status:", error.response?.status);

        console.error("Axios Response:", error.response?.data);

        console.error("Stack:", error.stack);

        return res.status(500).json({
            message: error.message,
            requestUrl: error.config?.url,
            requestMethod: error.config?.method,
            requestBody: error.config?.data,
            axiosStatus: error.response?.status,
            axiosResponse: error.response?.data
        });

    }
};
exports.addProduct = async (req, res) => {
    try {
        // Use authenticated user when possible
        const userId = (req.user && req.user.sub) || req.body.userId;
        const { productId } = req.body;

        let item = await Cart.findOne({ userId, productId });

        if (item) {
            item.quantity += 1;
            await item.save();
            return res.json(item);
        }

        item = await Cart.create({ userId, productId, quantity: 1 });

        res.status(201).json(item);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
exports.decreaseProduct = async (req, res) => {
    try {
        const userId = (req.user && req.user.sub) || req.body.userId;
        const { productId } = req.body;

        const item = await Cart.findOne({ userId, productId });

        if (!item) {
            return res.status(404).json({
                message: 'Item not found in cart'
            });
        }

        item.quantity -= 1;

        if (item.quantity < 1) {
            await Cart.findByIdAndDelete(item._id);

            return res.json({
                message: 'Item removed from cart'
            });
        }

        await item.save();

        res.json(item);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
exports.getUserCart = async (req, res) => {
    try {

        // Prefer authenticated user; prevent accessing another user's cart
        const tokenUser = req.user && req.user.sub;
        const paramUser = req.params.userId;
        if(tokenUser && paramUser && tokenUser !== paramUser){
            return res.status(403).json({ message: 'Forbidden' });
        }

        const userId = tokenUser || paramUser;

        const items = await Cart.find({ userId });

        res.json(items);

    } catch (error) {

        console.error('Checkout Error:', error);

        res.status(500).json({
        message: error.message,
        axiosStatus: error.response?.status,
        axiosResponse: error.response?.data
});

    }
};