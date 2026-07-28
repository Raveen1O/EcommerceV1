const Wishlist = require('../models/Wishlist');

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { productId } = req.body;

        const existingItem = await Wishlist.findOne({ userId, productId });
        if (existingItem) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        }

        const item = await Wishlist.create({ userId, productId });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get User Wishlist
exports.getUserWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const items = await Wishlist.find({ userId });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;

        const item = await Wishlist.findOneAndDelete({ userId, productId });
        if (!item) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }
        res.json({ message: 'Item removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
