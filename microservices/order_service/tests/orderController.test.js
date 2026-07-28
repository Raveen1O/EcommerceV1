const { test, mock } = require('node:test');
const assert = require('node:assert');

const Order = require('../src/models/Order');

let mockOrders = [
    {
        _id: 'order1',
        productId: 'prod1',
        quantity: 2,
        totalPrice: 200,
        createdAt: new Date().toISOString(),
        userId: 'user1'
    }
];

const mockFind = mock.fn((query) => {
    let result = query && query.userId ? mockOrders.filter(o => o.userId === query.userId) : mockOrders;
    return {
        sort: mock.fn(() => result),
        then: function(resolve) { resolve(result); },
        forEach: (cb) => result.forEach(cb),
        length: result.length
    };
});

mock.method(Order, 'find', mockFind);
mock.method(Order, 'findById', async (id) => mockOrders.find(o => o._id === id) || null);
mock.method(Order, 'create', async (data) => {
    const newOrder = { _id: 'order_' + Math.random().toString(36).substring(7), ...data };
    mockOrders.push(newOrder);
    return newOrder;
});
mock.method(Order, 'findByIdAndUpdate', async (id, data) => {
    const idx = mockOrders.findIndex(o => o._id === id);
    if (idx !== -1) {
        mockOrders[idx] = { ...mockOrders[idx], ...data };
        return mockOrders[idx];
    }
    return null;
});
mock.method(Order, 'findByIdAndDelete', async (id) => {
    const idx = mockOrders.findIndex(o => o._id === id);
    if (idx !== -1) {
        const deleted = mockOrders[idx];
        mockOrders.splice(idx, 1);
        return deleted;
    }
    return null;
});

global.fetch = mock.fn(async () => ({
    ok: true,
    json: async () => [
        { _id: 'prod1', category: 'electronics', stock: 10 }
    ]
}));

const orderController = require('../src/controllers/orderController');

test('Order getAnalytics should fetch products, compute metrics, and return json', async (t) => {
    Order.find.mock.resetCalls();
    global.fetch.mock.resetCalls();

    const req = {};
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; }, status() { return this; } };

    await orderController.getAnalytics(req, res);

    assert.ok(jsonBody, 'Analytics should be returned');
    assert.strictEqual(jsonBody.totalRevenue, 200);
});

test('Order createOrder should create a new order', async (t) => {
    const req = { body: { productId: 'prod2', quantity: 1, totalPrice: 100, userId: 'user2' } };
    let statusCode; let jsonBody;
    const res = { status(code) { statusCode = code; return this; }, json(body) { jsonBody = body; return this; } };
    
    await orderController.createOrder(req, res);
    
    assert.strictEqual(statusCode, 201);
    assert.strictEqual(jsonBody.productId, 'prod2');
});

test('Order getOrders should return all orders', async (t) => {
    const req = {};
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; }, status() { return this; } };
    
    await orderController.getOrders(req, res);
    assert.ok(jsonBody.length >= 2);
});

test('Order getOrdersByUser should return orders for user', async (t) => {
    const req = { params: { userId: 'user1' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; }, status() { return this; } };
    
    await orderController.getOrdersByUser(req, res);
    assert.strictEqual(jsonBody.length, 1);
    assert.strictEqual(jsonBody[0].userId, 'user1');
});

test('Order updateOrder should update existing order', async (t) => {
    const req = { params: { id: 'order1' }, body: { status: 'Paid' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; }, status() { return this; } };
    
    await orderController.updateOrder(req, res);
    assert.strictEqual(jsonBody.status, 'Paid');
});

test('Order deleteOrder should delete order and return success message', async (t) => {
    const req = { params: { id: 'order1' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; }, status() { return this; } };
    
    await orderController.deleteOrder(req, res);
    assert.ok(jsonBody.message.includes('deleted successfully'));
    
    // Verify it's gone
    const getReq = { params: { id: 'order1' } };
    let getStatus; let getBody;
    const getRes = { status(code) { getStatus = code; return this; }, json(body) { getBody = body; return this; } };
    
    await orderController.getOrderById(getReq, getRes);
    assert.strictEqual(getStatus, 404);
});
