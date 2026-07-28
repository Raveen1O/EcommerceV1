const fs = require('fs');
const path = 'microservices/product_service/tests/productController.test.js';

const newTests = `

test('Product createProduct should return 201 and new product', async (t) => {
    Product.create.mock.resetCalls();
    const req = { body: { name: 'Hat', price: 20 } };
    let statusCode;
    let jsonBody;
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    await productController.createProduct(req, res);

    assert.strictEqual(statusCode, 201);
    assert.strictEqual(jsonBody.name, 'Hat');
});

test('Product getProductById should return product if found', async (t) => {
    Product.findById.mock.resetCalls();
    const req = { params: { id: 'prod1' } };
    let statusCode;
    let jsonBody;
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    await productController.getProductById(req, res);

    assert.strictEqual(jsonBody.name, 'Shirt');
});

test('Product updateProduct should return updated product', async (t) => {
    Product.findByIdAndUpdate.mock.resetCalls();
    const req = { params: { id: 'prod1' }, body: { price: 55 } };
    let statusCode;
    let jsonBody;
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    await productController.updateProduct(req, res);

    assert.strictEqual(jsonBody.price, 55);
});

test('Product deleteProduct should return success message', async (t) => {
    Product.findByIdAndDelete.mock.resetCalls();
    const req = { params: { id: 'prod1' } };
    let statusCode;
    let jsonBody;
    const res = {
        status(code) { statusCode = code; return this; },
        json(body) { jsonBody = body; return this; }
    };

    await productController.deleteProduct(req, res);

    assert.ok(jsonBody.message.includes('deleted successfully'));
});
`;

fs.appendFileSync(path, newTests);
console.log('Appended tests');
