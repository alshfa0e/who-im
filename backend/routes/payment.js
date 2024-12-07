const express = require('express');
const router = express.Router();
const { processPayment, verifyPayment } = require('../controllers/paymentController');
const { authenticateRequest } = require('../middleware/auth');

// Process Google Pay payment
router.post('/process', authenticateRequest, async (req, res) => {
    try {
        const { paymentData, amount, currency = 'USD' } = req.body;
        const result = await processPayment(paymentData, amount, currency);
        res.json(result);
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Payment processing failed'
        });
    }
});

// Verify payment status
router.get('/verify/:paymentId', authenticateRequest, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const status = await verifyPayment(paymentId);
        res.json(status);
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Payment verification failed'
        });
    }
});

module.exports = router;