const { test, mock } = require('node:test');
const assert = require('node:assert');

// Mock dependencies
const axios = require('axios');
const Cart = require('../src/models/Cart');

mock.method(axios, 'get', async () => ({ data: { price: 100 } }));
mock.method(axios, 'post', async () => ({ data: { id: 'order123' } }));

let mockCarts = [
    { _id: 'cart1', productId: 'prod1', quantity: 2, userId: 'user1', save: async function() { return this; } }
];

mock.method(Cart, 'find', async (query) => {
    if (query && query.userId) {
        return mockCarts.filter(c => c.userId === query.userId);
    }
    return mockCarts;
});

mock.method(Cart, 'findById', async (id) => mockCarts.find(c => c._id === id) || null);

mock.method(Cart, 'findOne', async (query) => {
    if (query && query.userId && query.productId) {
        return mockCarts.find(c => c.userId === query.userId && c.productId === query.productId) || null;
    }
    return null;
});

mock.method(Cart, 'create', async (data) => {
    const newItem = { _id: 'cart_' + Math.random().toString(36).substring(7), ...data, save: async function() { return this; } };
    mockCarts.push(newItem);
    return newItem;
});

mock.method(Cart, 'findByIdAndUpdate', async (id, data) => {
    const idx = mockCarts.findIndex(c => c._id === id);
    if (idx !== -1) {
        mockCarts[idx] = { ...mockCarts[idx], ...data, save: async function() { return this; } };
        return mockCarts[idx];
    }
    return null;
});

mock.method(Cart, 'findByIdAndDelete', async (id) => {
    const idx = mockCarts.findIndex(c => c._id === id);
    if (idx !== -1) {
        const deleted = mockCarts[idx];
        mockCarts.splice(idx, 1);
        return deleted;
    }
    return null;
});

mock.method(Cart, 'deleteMany', async (query) => {
    if (query && query.userId) {
        mockCarts = mockCarts.filter(c => c.userId !== query.userId);
    }
    return true;
});

const cartController = require('../src/controllers/cartController');

test('Cart checkout should fetch products, create order, and return 201', async (t) => {
    const req = { user: { sub: 'user1' }, headers: { authorization: 'Bearer token123' } };
    let statusCode; let jsonBody;
    const res = { status(code) { statusCode = code; return this; }, json(body) { jsonBody = body; return this; } };
    await cartController.checkout(req, res);
    assert.strictEqual(statusCode, 201);
    assert.ok(jsonBody.message.includes('Checkout successful'));
});

test('Cart addToCart should create new cart item', async (t) => {
    const req = { user: { sub: 'user2' }, body: { productId: 'prod2', quantity: 1 } };
    let statusCode; let jsonBody;
    const res = { status(code) { statusCode = code; return this; }, json(body) { jsonBody = body; return this; } };
    await cartController.addToCart(req, res);
    assert.strictEqual(statusCode, 201);
    assert.strictEqual(jsonBody.productId, 'prod2');
});

test('Cart getUserCart should return items for a user', async (t) => {
    const req = { user: { sub: 'user1' }, params: { userId: 'user1' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.getUserCart(req, res);
    assert.ok(jsonBody.length >= 1);
    assert.strictEqual(jsonBody[0].userId, 'user1');
});

test('Cart getCartItems should return all items', async (t) => {
    const req = {};
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.getCartItems(req, res);
    assert.ok(jsonBody.length >= 1);
});

test('Cart getCartItemById should return item if found', async (t) => {
    const req = { params: { id: 'cart1' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.getCartItemById(req, res);
    assert.strictEqual(jsonBody.productId, 'prod1');
});

test('Cart updateCartItem should update and return item', async (t) => {
    const req = { params: { id: 'cart1' }, body: { quantity: 5 } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.updateCartItem(req, res);
    assert.strictEqual(jsonBody.quantity, 5);
});

test('Cart removeCartItem should delete item for owner', async (t) => {
    const req = { user: { sub: 'user1' }, params: { cartItemId: 'cart1' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.removeCartItem(req, res);
    assert.strictEqual(jsonBody.message, 'Item removed successfully');
});

test('Cart clearUserCart should remove all items for user', async (t) => {
    const req = { user: { sub: 'user2' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.clearUserCart(req, res);
    assert.strictEqual(jsonBody.message, 'Cart cleared successfully');
    
    // Verify it is cleared
    const remaining = mockCarts.filter(c => c.userId === 'user2');
    assert.strictEqual(remaining.length, 0);
});

test('Cart addProduct should increment quantity if exists', async (t) => {
    // Re-seed
    mockCarts.push({ _id: 'cart3', productId: 'prod3', quantity: 1, userId: 'user3', save: async function() { return this; } });
    
    const req = { user: { sub: 'user3' }, body: { productId: 'prod3' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.addProduct(req, res);
    assert.strictEqual(jsonBody.quantity, 2);
});

test('Cart decreaseProduct should decrement quantity', async (t) => {
    const req = { user: { sub: 'user3' }, body: { productId: 'prod3' } };
    let jsonBody;
    const res = { json(body) { jsonBody = body; return this; } };
    await cartController.decreaseProduct(req, res);
    assert.strictEqual(jsonBody.quantity, 1);
});
