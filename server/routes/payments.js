const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Create payment intent (Stripe simulation)
router.post('/create-payment-intent', auth, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isIn(['inr', 'usd']).withMessage('Invalid currency'),
  body('payment_method').isIn(['card', 'upi', 'wallet']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount, currency, payment_method, customer_info, items } = req.body;

    // Simulate payment intent creation
    // In production, this would integrate with Stripe API
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'requires_payment_method',
      payment_method_types: [payment_method],
      created: Math.floor(Date.now() / 1000),
      customer_info,
      items
    };

    console.log('Payment intent created:', paymentIntent);

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Server error creating payment intent' });
  }
});

// Confirm payment (simulation)
router.post('/confirm-payment', auth, [
  body('payment_intent_id').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { payment_intent_id, payment_method_id } = req.body;

    // Simulate payment confirmation
    // In production, this would confirm with Stripe
    const confirmedPayment = {
      id: payment_intent_id,
      status: 'succeeded',
      amount_received: 1000, // This would come from the original payment intent
      currency: 'inr',
      payment_method: payment_method_id,
      confirmed_at: new Date()
    };

    console.log('Payment confirmed:', confirmedPayment);

    res.json({
      payment_intent: confirmedPayment,
      success: true
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Server error confirming payment' });
  }
});

module.exports = router;