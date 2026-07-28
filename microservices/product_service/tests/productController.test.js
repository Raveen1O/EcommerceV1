const { test, mock } = require('node:test');
const assert = require('node:assert');

// Mock dependencies
const Product = require('../src/models/Product');

// Mutable array to simulate a real database for the full flow test
let mockProducts = [
    { _id: 'prod1', name: 'Shirt', category: 'clothing', price: 50 },
    { _id: 'prod2', name: 'Pants', category: 'clothing', price: 60 }
];

const queryMock = {
    sort: mock.fn(() => mockProducts),
    then: function(resolve) { resolve(mockProducts); }
};

const mockFind = mock.fn(() => queryMock);

mock.method(Product, 'find', mockFind);
mock.method(Product, 'findById', async (id) => mockProducts.find(p => p._id === id) || null);
mock.method(Product, 'create', async (data) => {
    const newProduct = { _id: 'test_prod_' + Math.random().toString(36).substring(7), ...data };
    mockProducts.push(newProduct);
    return newProduct;
});
mock.method(Product, 'findByIdAndUpdate', async (id, data) => {
    const idx = mockProducts.findIndex(p => p._id === id);
    if (idx !== -1) {
        mockProducts[idx] = { ...mockProducts[idx], ...data };
        return mockProducts[idx];
    }
    return null;
});
mock.method(Product, 'findByIdAndDelete', async (id) => {
    const idx = mockProducts.findIndex(p => p._id === id);
    if (idx !== -1) {
        const deleted = mockProducts[idx];
        mockProducts.splice(idx, 1);
        return deleted;
    }
    return null;
});

const productController = require('../src/controllers/productController');

test('Product getProducts should return product list', async (t) => {
    mockFind.mock.resetCalls();
    const req = { query: { category: 'clothing', sort: 'price-asc' } };
    let jsonBody;
    const res = { status() { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.getProducts(req, res);
    assert.ok(jsonBody, 'Products should be returned');
    assert.ok(jsonBody.length >= 2);
});

test('Product createProduct should return 201 and new product', async (t) => {
    const req = { body: { name: 'Hat', price: 20 } };
    let statusCode;
    let jsonBody;
    const res = { status(code) { statusCode = code; return this; }, json(body) { jsonBody = body; return this; } };
    await productController.createProduct(req, res);
    assert.strictEqual(statusCode, 201);
    assert.strictEqual(jsonBody.name, 'Hat');
});

test('Product getProductById should return product if found', async (t) => {
    const req = { params: { id: 'prod1' } };
    let jsonBody;
    const res = { status() { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.getProductById(req, res);
    assert.strictEqual(jsonBody.name, 'Shirt');
});

test('Product updateProduct should return updated product', async (t) => {
    const req = { params: { id: 'prod1' }, body: { price: 55 } };
    let jsonBody;
    const res = { status() { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.updateProduct(req, res);
    assert.strictEqual(jsonBody.price, 55);
});

test('Product full deletion flow: Create, Delete, Verify, Cleanup', async (t) => {
    // 1. Create a test product
    const createReq = { body: { name: 'DeleteMe', price: 10 } };
    let createBody;
    const createRes = { status() { return this; }, json(body) { createBody = body; return this; } };
    await productController.createProduct(createReq, createRes);
    
    const testId = createBody._id;
    assert.strictEqual(createBody.name, 'DeleteMe');

    // 2. Delete that product
    const deleteReq = { params: { id: testId } };
    let deleteBody;
    const deleteRes = { status() { return this; }, json(body) { deleteBody = body; return this; } };
    await productController.deleteProduct(deleteReq, deleteRes);
    
    assert.ok(deleteBody.message.includes('deleted successfully'));

    // 3. Verify it's gone
    const getReq = { params: { id: testId } };
    let getStatus;
    let getBody;
    const getRes = { status(code) { getStatus = code; return this; }, json(body) { getBody = body; return this; } };
    await productController.getProductById(getReq, getRes);
    
    assert.strictEqual(getStatus, 404);
    assert.strictEqual(getBody.message, 'Product not found');

    // 4. Clean up any remaining test data (ensure it's not in the mock array)
    const exists = mockProducts.some(p => p._id === testId);
    assert.strictEqual(exists, false, 'Test product should be completely cleaned up from the datastore');
});
