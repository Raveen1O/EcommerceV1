const { test, mock } = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

// Mock @aws-sdk/client-cloudwatch
const mockCWSend = mock.fn(async () => ({}));
const mockCloudWatch = {
    CloudWatchClient: class {
        send = mockCWSend;
        middlewareStack = { remove: mock.fn(), use: mock.fn() };
    },
    PutMetricDataCommand: class {}
};

// Mock @aws-sdk/client-sns
const mockSend = mock.fn(async () => ({ MessageId: 'msg123' }));
const mockSNS = {
    SNSClient: class {
        send = mockSend;
        middlewareStack = {
            remove: mock.fn(),
            use: mock.fn()
        };
    },
    PublishCommand: class {}
};

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
    if (request === '@aws-sdk/client-sns') {
        return mockSNS;
    }
    if (request === '@aws-sdk/client-cloudwatch') {
        return mockCloudWatch;
    }
    return originalLoad.apply(this, arguments);
};

// Mock other dependencies
const axios = require('axios');
const Payment = require('../src/models/Payment');

mock.method(axios, 'get', async (url) => {
    if (url.includes('orders')) {
        return { data: { _id: 'order1', status: 'Pending', productId: 'prod1', quantity: 1, totalPrice: 100, userId: 'user1' } };
    }
    if (url.includes('products')) {
        return { data: { _id: 'prod1', stock: 10 } };
    }
});

mock.method(axios, 'patch', async () => ({ data: {} }));
mock.method(axios, 'delete', async () => ({ data: {} }));

let mockPayments = [];

mock.method(Payment, 'find', async () => mockPayments);
mock.method(Payment, 'create', async (data) => {
    const newPayment = { _id: 'pay_' + Math.random().toString(36).substring(7), ...data };
    mockPayments.push(newPayment);
    return newPayment;
});

const paymentController = require('../src/controllers/paymentController');

test('Payment processPayment should succeed with valid test card and create a payment', async (t) => {
    mockSend.mock.resetCalls();
    axios.get.mock.resetCalls();
    axios.patch.mock.resetCalls();
    axios.delete.mock.resetCalls();

    const req = {
        body: {
            orderId: 'order1',
            fullName: 'Test User',
            email: 'test@example.com',
            cardNumber: '4242 4242 4242 4242',
            expiry: '12/25',
            cvc: '123'
        },
        headers: {}
    };

    let statusCode;
    let jsonBody;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            jsonBody = body;
            return this;
        }
    };

    await paymentController.processPayment(req, res);

    assert.strictEqual(statusCode, 201);
    assert.strictEqual(jsonBody.messageId, 'msg123');
    assert.strictEqual(jsonBody.payment.status, 'Success');

    assert.strictEqual(axios.get.mock.calls.length, 2);
    assert.strictEqual(axios.patch.mock.calls.length, 1);
    assert.strictEqual(axios.delete.mock.calls.length, 1);
    assert.strictEqual(mockSend.mock.calls.length, 1);
    
    // Verify it was saved to the mock db
    assert.strictEqual(mockPayments.length, 1);
    assert.strictEqual(mockPayments[0].amount, 100);
});

test('Payment getPayments should return all payments', async (t) => {
    const req = {};
    let statusCode;
    let jsonBody;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            jsonBody = body;
            return this;
        }
    };

    await paymentController.getPayments(req, res);
    
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonBody.length, 1);
    assert.strictEqual(jsonBody[0].amount, 100);
});
