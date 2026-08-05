const { test, mock } = require('node:test');
const assert = require('node:assert');
const axios = require('axios');

// Mock axios methods before importing the handler
mock.method(axios, 'get', async () => ({ data: { stock: 10 } }));
mock.method(axios, 'put', async () => ({ data: {} }));

const { handler } = require('../index');

test('Inventory service handler should update inventory based on SQS event', async (t) => {
    // Reset mock history
    axios.get.mock.resetCalls();
    axios.put.mock.resetCalls();

    const mockEvent = {
        Records: [
            {
                body: JSON.stringify({
                    Message: JSON.stringify({
                        productId: 'prod123',
                        quantity: 2,
                        orderId: 'order123'
                    })
                })
            }
        ]
    };

    const response = await handler(mockEvent);

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, JSON.stringify({ message: 'All SQS messages processed successfully' }));

    assert.strictEqual(axios.get.mock.calls.length, 1);
    assert.strictEqual(axios.put.mock.calls.length, 2);

    const putCallArgs = axios.put.mock.calls[0].arguments;
    assert.ok(putCallArgs[0].includes('prod123'));
    assert.deepStrictEqual(putCallArgs[1], { stock: 8 }); // 10 - 2
});

test('Inventory service handler should throw error on invalid JSON', async (t) => {
    const originalConsoleError = console.error;
    console.error = () => {}; // Silence expected error in test output
    
    const mockEvent = {
        Records: [
            {
                body: "invalid-json"
            }
        ]
    };

    let didThrow = false;
    try {
        await handler(mockEvent);
    } catch (e) {
        didThrow = true;
    }
    
    console.error = originalConsoleError;
    assert.strictEqual(didThrow, true);
});

test('Inventory service handler should throw if upstream API fails', async (t) => {
    const originalConsoleError = console.error;
    console.error = () => {}; // Silence expected error in test output

    axios.get.mock.mockImplementationOnce(async () => { throw new Error('API down'); });
    
    const mockEvent = {
        Records: [
            {
                body: JSON.stringify({
                    Message: JSON.stringify({
                        productId: 'prod123',
                        quantity: 2
                    })
                })
            }
        ]
    };

    let didThrow = false;
    try {
        await handler(mockEvent);
    } catch (e) {
        didThrow = true;
        assert.strictEqual(e.message, 'API down');
    }
    
    console.error = originalConsoleError;
    assert.strictEqual(didThrow, true);
});
