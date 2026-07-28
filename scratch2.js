const { test, mock } = require('node:test');
const assert = require('node:assert');

test('example mock', (t) => {
    const fn = mock.fn(() => 42);
    assert.strictEqual(fn(), 42);
});
