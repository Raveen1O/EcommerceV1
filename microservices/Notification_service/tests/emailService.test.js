const { test, mock } = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mockSendMail = mock.fn(async () => ({ response: '250 Message accepted' }));
const mockNodemailer = {
    createTransport: mock.fn(() => ({
        sendMail: mockSendMail
    }))
};

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
    if (request === 'nodemailer') {
        return mockNodemailer;
    }
    return originalLoad.apply(this, arguments);
};

const emailService = require('../src/services/emailService');

test('Email Service should send a payment success email using nodemailer', async (t) => {
    mockSendMail.mock.resetCalls();
    mockNodemailer.createTransport.mock.resetCalls();

    const mockMessage = {
        orderId: 'ORD-999',
        productId: 'PROD-123',
        quantity: 2,
        amount: 500,
        customerName: 'Alice',
        customerEmail: 'alice@example.com'
    };

    await emailService.sendPaymentSuccessEmail(mockMessage);

    assert.strictEqual(mockSendMail.mock.calls.length, 1);
    const mailOptions = mockSendMail.mock.calls[0].arguments[0];
    
    assert.strictEqual(mailOptions.to, 'alice@example.com');
    assert.strictEqual(mailOptions.subject, 'Order ORD-999 Confirmed');
    assert.ok(mailOptions.html.includes('Alice'));
    assert.ok(mailOptions.html.includes('ORD-999'));
    assert.ok(mailOptions.html.includes('PROD-123'));
    assert.ok(mailOptions.html.includes('₹500'));
});
