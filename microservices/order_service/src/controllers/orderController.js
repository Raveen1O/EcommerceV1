const Order = require('../models/Order');

// CREATE
exports.createOrder = async (req, res) => {
    const start = Date.now();
    try {
        const order = await Order.create(req.body);

        try {
            const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
            const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
            await cwClient.send(new PutMetricDataCommand({
                Namespace: 'Lumina/BusinessMetrics',
                MetricData: [{
                    MetricName: 'Revenue',
                    Value: req.body.totalPrice,
                    Dimensions: [{ Name: 'FunctionName', Value: 'raveen-order_service' }]
                }]
            }));
        } catch(e) { console.error('CW Error', e); }

        res.status(201).json(order);

    } catch (error) {
        const duration_ms = Date.now() - start;
        console.error(JSON.stringify({
            message: 'Checkout attempt failed',
            user_id: req.body.userId || 'unknown',
            cart_value: req.body.totalPrice || 0,
            payment_method: req.body.paymentMethod || 'unknown',
            trace_id: req.headers['x-amzn-trace-id'] || 'none',
            duration_ms: duration_ms,
            status: 'failed',
            error: error.message
        }));

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

// GET BY USER ID
exports.getOrdersByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// GET ANALYTICS
exports.getAnalytics = async (req, res) => {
    try {
        const orders = await Order.find();
        let products = [];
        try {
            const productRes = await fetch(`${process.env.API_BASE_URL}api/products`);
            if (productRes.ok) {
                products = await productRes.json();
            }
        } catch (err) {
            console.error('Failed to fetch products for analytics');
        }

        if (!Array.isArray(products)) products = [];

        const productsMap = {};
        products.forEach(p => { productsMap[p._id] = p; });

        let totalRevenue = 0;
        let totalOrders = orders.length;
        let revenueTrends = {};
        let ordersPerDay = {};
        let productSales = {};
        let categorySales = {};

        orders.forEach(order => {
            totalRevenue += order.totalPrice || 0;
            
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            revenueTrends[date] = (revenueTrends[date] || 0) + (order.totalPrice || 0);
            ordersPerDay[date] = (ordersPerDay[date] || 0) + 1;

            const pid = order.productId;
            productSales[pid] = (productSales[pid] || 0) + order.quantity;

            const product = productsMap[pid];
            if (product) {
                const cat = product.category || 'Unknown';
                categorySales[cat] = (categorySales[cat] || 0) + (order.totalPrice || 0);
            }
        });

        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const lowStockProducts = products.filter(p => p.stock < 3);

        const topSellingProducts = Object.keys(productSales)
            .map(pid => ({
                product: productsMap[pid] || { name: 'Unknown' },
                quantitySold: productSales[pid]
            }))
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 5);

        res.json({
            totalRevenue,
            totalOrders,
            averageOrderValue,
            revenueTrends,
            ordersPerDay,
            topSellingProducts,
            categorySales,
            lowStockCount: lowStockProducts.length,
            lowStockProducts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
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