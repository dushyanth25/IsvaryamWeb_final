import { Router } from 'express';
import handler from 'express-async-handler';
import auth from '../middleware/auth.mid.js';
import { BAD_REQUEST, UNAUTHORIZED } from '../constants/httpStatus.js';
import { OrderModel } from '../models/order.model.js';
import { PaymentModel } from '../models/payment.model.js';
import { OrderStatus } from '../constants/orderStatus.js';
import { UserModel } from '../models/user.model.js';
import { sendEmailReceipt } from '../helpers/mail.helper.js';
import { FoodModel } from '../models/food.model.js';
import admin from '../middleware/admin.mid.js';
import Razorpay from 'razorpay';
// At the top, import nodemailer
import nodemailer from 'nodemailer';

import crypto from 'crypto';
import DeliveryChargeModel from '../models/deliveryCharge.model.js';
import cron from 'node-cron';
// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = Router();
router.use(auth);

// Store's state (set this to your actual store state)
const STORE_STATE = 'Tamil Nadu'; // Change as needed
// helper to send order email (can be used for admin or user)

const sendAdminOrderEmail = async (order, user) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    const productDetails = order.items.map(item => {
      return `
        <li>
          <b>${item.product?.name || 'Unknown Product'}</b>  
          Qty: ${item.quantity}  
          Price: ₹${item.price}
        </li>
      `;
    }).join('');

    const htmlContent = `
      <h2>New Order Received</h2>
      <p><b>User:</b> ${user.name} (${user.email})</p>
      <p><b>Status:</b> ${order.status}</p>

      <p><b>Phone:</b> ${user.phone || 'N/A'}</p>
      <p><b>Location:</b> ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.pincode}</p>
      <p><b>Total Price:</b> ₹${order.totalPrice}</p>
      
      <h3>Products:</h3>
      <ul>
        ${productDetails}
      </ul>
      
      <p>Order ID: ${order._id}</p>
      <p>Placed at: ${order.createdAt}</p>
    `;

    // ✅ Send to admin
    await transporter.sendMail({
      from: `"Isvaryam Store" <${process.env.ADMIN_EMAIL}>`,
      to: "v.gugan16@gmail.com", // Admin
      subject: `🛒 New Order Placed - ${user.name}`,
      html: htmlContent,
    });

    // ✅ Send to user also
    await transporter.sendMail({
      from: `"Isvaryam Store" <${process.env.ADMIN_EMAIL}>`,
      to: "71762233016@cit.edu", // user email
      subject: `✅ Your Order Confirmation - ${order._id}`,
      html: `
        <h2>Thank you for your order, ${user.name}!</h2>
        ${htmlContent}
        <p>We will update you once your order is shipped 🚚</p>
      `,
    });

    console.log("📧 Admin & User emails sent successfully");

  } catch (err) {
    console.error("❌ Error sending order email:", err);
  }
};

// ✅ Create Order in DB
router.post(
  '/create',
  handler(async (req, res) => {
    const order = req.body;

    // Validate address object
    if (!order.address || !order.address.state || !order.address.pincode) {
      return res.status(400).send('Address, state, and pincode are required');
    }

    // Validate totalPrice
    if (isNaN(order.totalPrice)) {
      return res.status(400).send('Invalid total price');
    }

    // Delivery charge logic
    const customerState = (order.state || order.address.state || '').trim().toLowerCase();
    const storeState = STORE_STATE.trim().toLowerCase();

    const normalizedCustomerState = customerState.replace(/\s+/g, '').toLowerCase();
    const normalizedStoreState = storeState.replace(/\s+/g, '').toLowerCase();

    let deliveryCharge = 0;
    if (normalizedCustomerState && normalizedCustomerState !== normalizedStoreState) {
      const chargeDoc = await DeliveryChargeModel.findOne({
        fromState: STORE_STATE,
        toState: { $regex: `^${normalizedCustomerState}$`, $options: 'i' }
      });
      deliveryCharge = chargeDoc ? chargeDoc.charge : 200;
    } else if (normalizedCustomerState === normalizedStoreState) {
      deliveryCharge = 0;
    } else {
      deliveryCharge = 200;
    }

    // ✅ persist deliveryCharge and recalc totalPrice
    order.deliveryCharge = deliveryCharge;
    order.totalPrice = order.totalPrice + deliveryCharge;
    order.user = req.user.id;
    order.status = OrderStatus.PENDING;

    // Save order
    const createdOrder = await OrderModel.create(order);

    // ✅ Populate products for email
    const populatedOrder = await OrderModel.findById(createdOrder._id)
      .populate('items.product', 'name price images');

    // ✅ Get user info from DB
    const user = await UserModel.findById(req.user.id);

    // ✅ Send admin + user email with populated products

    res.send(populatedOrder);
  })
);


// ✅ Create Razorpay Payment Order
router.post(
  '/razorpay/create-order',
  handler(async (req, res) => {
    try {
      const order = await getNewOrderForCurrentUser(req);
      if (!order) {
        return res.status(BAD_REQUEST).json({ error: 'Order Not Found!' });
      }

      // Ensure amount is in paise
      const amountInPaise = Math.round(order.totalPrice * 100);

      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `order_rcptid_${order._id}`,
        payment_capture: 1 // Auto capture payment
      };

      const razorpayOrder = await razorpay.orders.create(options);

      res.json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      });

    } catch (err) {
      console.error('❌ Razorpay Create Order Error:', err);
      res.status(500).json({
        error: 'Failed to create Razorpay order',
        message: err.message
      });
    }
  })
);

// ✅ Verify Razorpay Payment
router.post(
  '/razorpay/verify-payment',
  handler(async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(BAD_REQUEST).json({ error: 'Missing required payment verification fields' });
      }

      // Generate expected signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      console.log('🔍 Signature Check:', {
        expected: expectedSignature,
        received: razorpay_signature
      });

      if (expectedSignature !== razorpay_signature) {
        return res.status(BAD_REQUEST).json({ error: 'Invalid Signature!' });
      }

      const order = await getNewOrderForCurrentUser(req);
      if (!order) {
        return res.status(BAD_REQUEST).json({ error: 'Order Not Found!' });
      }

      // Save payment details
      const payment = new PaymentModel({
        order: order._id,
        user: req.user.id,
        paymentId: razorpay_payment_id,
        method: 'Razorpay',
        amount: order.totalPrice,
        status: 'COMPLETED'
      });
      await payment.save();

      // Update order status
      order.paymentId = razorpay_payment_id;
      order.status = OrderStatus.PAYED;
      await order.save();

      // Send email receipt
      sendEmailReceipt(order);

      res.json({
        success: true,
        orderId: order._id,
        paymentId: payment._id,
        paymentStatus: 'COMPLETED'
      });

    } catch (err) {
      console.error('❌ Razorpay Verify Payment Error:', err);
      res.status(500).json({
        error: 'Failed to verify Razorpay payment',
        message: err.message
      });
    }
  })
);

// In order.router.js - Fix the track order route
// In order.router.js - Fix the track order route
router.get(
  '/track/:orderId',
  handler(async (req, res) => {
    const { orderId } = req.params;
    const user = await UserModel.findById(req.user.id);

    const filter = { _id: orderId };
    if (!user.isAdmin) filter.user = user._id;

    const order = await OrderModel.findOne(filter).populate('items.product');
    if (!order) return res.send(UNAUTHORIZED);

    return res.send(order);
  })
);
// ✅ Delete Order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get New Order for Current User
// In order.router.js - Fix the newOrderForCurrentUser route
router.get('/newOrderForCurrentUser', auth, async (req, res) => {
  try {
    const order = await OrderModel.findOne({
      user: req.user.id,
      status: OrderStatus.PENDING,
    })
      .populate('user')
      .populate({
        path: 'items.product',
        select: 'name images quantities',
      });

    if (!order) return res.status(404).send({ message: 'No active order found' });

    res.send(order);
  } catch (err) {
    console.error('Error in newOrderForCurrentUser:', err);
    res.status(500).send({ error: err.message });
  }
});

// ✅ Get All Status
router.get('/allstatus', (req, res) => {
  const allStatus = Object.values(OrderStatus);
  res.send(allStatus);
});

// ✅ Get Orders by Status
// In order.router.js - Fix the getAll route
router.get(
  '/:status?',
  handler(async (req, res) => {
    const status = req.params.status;
    const user = await UserModel.findById(req.user.id);
    const filter = {};

    if (!user.isAdmin) filter.user = user._id;
    if (status) filter.status = status;

    const orders = await OrderModel.find(filter)
      .populate({
        path: 'items.product',  // Add this populate
        select: 'name images quantities'
      })
      .sort('-createdAt');

    res.send(orders);
  })
);

// ✅ Get All Orders (Admin)
router.get(
  '/orders',
  admin,
  handler(async (req, res) => {
    const { user, status, from, to } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const orders = await OrderModel.find(filter)
      .populate('items.product')
      .populate('user')
      .populate({ path: 'payment', select: 'status' })
      .sort('-createdAt');

    res.json(orders);
  })
);

// ✅ Update Order Status (Admin)
router.patch(
  '/order/:id/status',
  admin,
  handler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  })
);

// ✅ Update Payment Status (Admin)
router.patch(
  '/payment/:id/status',
  admin,
  handler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await PaymentModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (status === 'COMPLETED') {
      const order = await OrderModel.findById(payment.order);
      if (order && order.status !== OrderStatus.PAYED) {
        order.status = OrderStatus.PAYED;
        order.paymentId = payment.paymentId;
        await order.save();
      }
    }

    res.json(payment);
  })
);

// ✅ User Purchase Count
router.get('/user-purchase-count', auth, async (req, res) => {
  try {
    const count = await OrderModel.countDocuments({ user: req.user.id, status: 'PAYED' });
    res.json({ count });
  } catch (err) {
    console.error('Error in user-purchase-count:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Get Order by ID
router.get(
  '/order/:id',
  handler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  })
);

const getNewOrderForCurrentUser = async req =>
  await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.PENDING,
  })
    .sort({ createdAt: -1 })
    .populate('user');
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 15);

OrderModel.deleteMany({
  status: OrderStatus.PENDING,
  createdAt: { $lt: cutoffDate }
})
  .then(result => {
    console.log(`🗑️ Deleted ${result.deletedCount} NEW orders older than 15 days`);
  })
  .catch(err => {
    console.error('❌ Error deleting old orders:', err);
  });
// Cleanup old "NEW" orders in DB
OrderModel.deleteMany({ status: 'NEW' })
  .then(result => {
    console.log(`🗑️ Deleted ${result.deletedCount} orders with status NEW`);
  })
  .catch(err => {
    console.error('❌ Error deleting NEW orders:', err);
  });

// helper to send admin email for new order

router.get('/:id', auth, admin, handler(async (req, res) => {
  const product = await FoodModel.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}));

// ✅ Update product by ID
router.put('/:id', auth, admin, handler(async (req, res) => {
  const updatedData = req.body;

  const product = await FoodModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  res.json({ message: 'Product updated successfully', product });
}));
/*router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});*/

export default router;
