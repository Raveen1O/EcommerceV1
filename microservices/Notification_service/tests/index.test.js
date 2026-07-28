const { test, mock } = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const path = require('path');

const mockEmailService = {
    sendPaymentSuccessEmail: mock.fn(async () => true)
};

// Monkey-patch require to fix broken paths in Notification_service and mock emailService
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
    if (request === './services/emailService') {
        return mockEmailService;
    }
    if (request === '../src/handler') {
        request = '../src/services/handler';
    }
    return originalLoad.apply(this, arguments);
};

const { handler } = require('../src/services/handler');

test('Notification service handler should process SQS event and send email', async (t) => {
    mockEmailService.sendPaymentSuccessEmail.mock.resetCalls();

    const mockEvent = {
        Records: [
            {
                body: JSON.stringify({
                    Message: JSON.stringify({
                        eventType: 'PaymentSucceeded',
                        orderId: 'order123'
                    })
                })
            }
        ]
    };

    const response = await handler(mockEvent);

    assert.strictEqual(response.statusCode, 200);
    assert.ok(response.body.includes('Notification processed successfully'));

    assert.strictEqual(mockEmailService.sendPaymentSuccessEmail.mock.calls.length, 1);
    const callArgs = mockEmailService.sendPaymentSuccessEmail.mock.calls[0].arguments;
    assert.deepStrictEqual(callArgs[0], {
        eventType: 'PaymentSucceeded',
        orderId: 'order123'
    });
});
