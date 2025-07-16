const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOrderConfirmation } = require('../utils/emailService');

const router = express.Router();

// Create order
router.post('/create', auth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('billing.firstName').notEmpty().withMessage('First name is required'),
  body('billing.lastName').notEmpty().withMessage('Last name is required'),
  body('billing.email').isEmail().withMessage('Valid email is required'),
  body('billing.phone').notEmpty().withMessage('Phone number is required'),
  body('payment.method').isIn(['card', 'upi', 'wallet']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, billing, payment } = req.body;

    // Calculate amounts
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const processingFee = Math.round(subtotal * 0.029); // 2.9% processing fee
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + processingFee + tax;

    // Create order
    const order = new Order({
      orderId: Order.generateOrderId(),
      userId: req.user.userId,
      items,
      billing,
      payment: {
        method: payment.method,
        amount: {
          subtotal,
          processingFee,
          tax,
          discount: 0,
          total
        }
      },
      metadata: {
        source: 'web',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    await order.save();

    // Add to order history
    await order.addHistory('pending', 'Order created');

    // Log user activity
    const user = await User.findById(req.user.userId);
    if (user) {
      await user.addActivity('order_created', { 
        orderId: order.orderId, 
        total: total,
        itemCount: items.length 
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.payment.amount.total,
        items: order.items,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-metadata -history');

    const total = await Order.countDocuments({ userId: req.user.userId });

    res.json({
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      orderId, 
      userId: req.user.userId 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only - you can add admin middleware)
router.put('/:orderId/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.addHistory(status, note, req.user.userId);

    // If order is completed, add purchased programs to user
    if (status === 'completed') {
      const user = await User.findById(order.userId);
      if (user) {
        const programIds = order.items
          .filter(item => item.type === 'program')
          .map(item => item.id);
        
        user.purchasedPrograms = [...new Set([...user.purchasedPrograms, ...programIds])];
        await user.save();
        
        await user.addActivity('programs_purchased', { 
          orderId: order.orderId,
          programs: programIds 
        });
      }

      // Send completion email
      try {
        await sendOrderConfirmation(order);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    res.json({
      message: 'Order status updated successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.post('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ 
      orderId, 
      userId: req.user.userId 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    await order.addHistory('cancelled', reason || 'Cancelled by user');

    // Log user activity
    const user = await User.findById(req.user.userId);
    if (user) {
      await user.addActivity('order_cancelled', { 
        orderId: order.orderId, 
        reason 
      });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;