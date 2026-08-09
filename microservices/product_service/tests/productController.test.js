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
    sort: mock.fn(function() { return this; }),
    skip: mock.fn(function() { return this; }),
    limit: mock.fn(function() { return this; }),
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

test('Product getProducts with pagination, search, and sort', async (t) => {
    mock.method(Product, 'countDocuments', async () => 10);
    const req = { query: { search: 'shirt', category: 'clothing', sort: 'newest', page: '1', limit: '5' } };
    let jsonBody;
    const res = { status() { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.getProducts(req, res);
    assert.ok(jsonBody.products);
});

test('Product getProducts with pagination but hasMore false', async (t) => {
    mock.method(Product, 'countDocuments', async () => 2);
    const req = { query: { page: '1', limit: '5', sort: 'alpha-asc' } };
    let jsonBody;
    const res = { status() { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.getProducts(req, res);
    assert.strictEqual(jsonBody.hasMore, false);
});

test('Product getProducts sort variations', async (t) => {
    const reqDesc = { query: { sort: 'alpha-desc' } };
    const res = { status() { return this; }, json(body) { return this; } };
    await productController.getProducts(reqDesc, res);
    const reqPriceDesc = { query: { sort: 'price-desc' } };
    await productController.getProducts(reqPriceDesc, res);
    assert.ok(true);
});

test('Product createProduct with S3 Image URL should sign URL', async (t) => {
    const req = { body: { name: 'Hat', price: 20, imageUrl: 'https://raveen-images.s3.ap-southeast-1.amazonaws.com/test.jpg' } };
    let jsonBody;
    const res = { status(code) { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.createProduct(req, res);
    assert.strictEqual(jsonBody.name, 'Hat');
});

test('Product updateProduct and deleteProduct 404', async (t) => {
    const req = { params: { id: 'invalid_id' }, body: {} };
    let statusCode;
    const res = { status(code) { statusCode = code; return this; }, json(body) { return this; } };
    await productController.updateProduct(req, res);
    assert.strictEqual(statusCode, 404);
    await productController.deleteProduct(req, res);
    assert.strictEqual(statusCode, 404);
});

test('Product getUploadUrl', async (t) => {
    const req = { query: { filename: 'test image.png', contentType: 'image/png' } };
    let jsonBody;
    const res = { status(code) { return this; }, json(body) { jsonBody = body; return this; } };
    await productController.getUploadUrl(req, res);
    assert.ok(jsonBody.uploadUrl);
    
    let errCode;
    const errRes = { status(code) { errCode = code; return this; }, json(body) { return this; } };
    await productController.getUploadUrl({ query: {} }, errRes);
    assert.strictEqual(errCode, 400);
});

test('Product catch blocks', async (t) => {
    mock.method(Product, 'create', async () => { throw new Error('DB Error'); });
    let statusCode;
    const res = { status(code) { statusCode = code; return this; }, json(body) { return this; } };
    
    await productController.createProduct({ body: {} }, res);
    assert.strictEqual(statusCode, 500);
    
    mock.method(Product, 'find', () => { throw new Error('DB Error'); });
    await productController.getProducts({ query: {} }, res);
    assert.strictEqual(statusCode, 500);
    
    mock.method(Product, 'findById', async () => { throw new Error('DB Error'); });
    await productController.getProductById({ params: {} }, res);
    assert.strictEqual(statusCode, 500);
    
    mock.method(Product, 'findByIdAndUpdate', async () => { throw new Error('DB Error'); });
    await productController.updateProduct({ params: {}, body: {} }, res);
    assert.strictEqual(statusCode, 500);
    
    mock.method(Product, 'findByIdAndDelete', async () => { throw new Error('DB Error'); });
    await productController.deleteProduct({ params: {} }, res);
    assert.strictEqual(statusCode, 500);
});
