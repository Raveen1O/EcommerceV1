const express = require('express');
const router = express.Router();

const {
    processPayment,
    getPayments
} = require('../controllers/paymentController');

router.post('/', processPayment);
router.post('/confirm', processPayment);

router.get('/', getPayments);

module.exports = router;