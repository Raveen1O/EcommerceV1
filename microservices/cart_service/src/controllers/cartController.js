const axios = require('axios');
const Cart = require('../models/Cart');

// Add Item
exports.addToCart = async (req, res) => {

    try {

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

        const item = await Cart.findByIdAndDelete(
            req.params.cartItemId
        );

        if (!item) {
            return res.status(404).json({
                message: 'Cart item not found'
            });
        }

        res.json({
            message: 'Item removed successfully'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};
exports.checkout = async (req, res) => {

    try {

        const userId = req.params.userId;

        const cartItems = await Cart.find({ userId });

        if (cartItems.length === 0) {

            return res.status(400).json({
                message: 'Cart is empty'
            });
        }

        let totalPrice = 0;

        for (const item of cartItems) {

            const productResponse = await axios.get(
                `http://localhost:5000/api/products/${item.productId}`
            );

            const product = productResponse.data;

            totalPrice += product.price * item.quantity;
        }

        const firstItem = cartItems[0];

        const orderResponse = await axios.post(
            'http://localhost:5001/api/orders',
            {
                productId: firstItem.productId,
                quantity: firstItem.quantity,
                totalPrice,
                status: 'Pending'
            }
        );

        await Cart.deleteMany({
            userId
        });

        res.status(201).json({
            message: 'Checkout successful',
            order: orderResponse.data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};
exports.addProduct = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        let item = await Cart.findOne({
            userId,
            productId
        });

        if (item) {
            item.quantity += 1;
            await item.save();
            return res.json(item);
        }

        item = await Cart.create({
            userId,
            productId,
            quantity: 1
        });

        res.status(201).json(item);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
exports.decreaseProduct = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const item = await Cart.findOne({
            userId,
            productId
        });

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

        const items = await Cart.find({
            userId: req.params.userId
        });

        res.json(items);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};