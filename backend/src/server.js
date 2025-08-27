import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';

import foodRouter from './routers/food.router.js';
import userRouter from './routers/user.router.js';
import orderRouter from './routers/order.router.js';
import uploadRouter from './routers/upload.router.js';
import reviewRouter from './routers/review.router.js';
import whishlistRouter from './routers/whishlist.router.js';
import analyticsRouter from './routers/analytics.router.js';
import cartRouter from './routers/cart.router.js';
import { dbconnect } from './config/database.config.js';
import couponRouter from './routers/coupon.router.js';
import recipeRouter from './routers/recipe.router.js';
import forgetRouter from './routers/forget.router.js';
import otpRoute from './routers/auth.router.js';
import mailRoute from './routers/contact.router.js';

import imageRouter from './routers/image.router.js';
import colorRouter from './routers/color.router.js';


import './models/user.model.js';
import './models/food.model.js';
import './models/order.model.js';

// Connect to DB
dbconnect();

// Setup __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// ✅ Use single origin: backend domain (local or prod)
const allowedOrigins = [
  'http://localhost:5000',   // local single-domain
  'https://isvaryam.com',
  'https://isvaryamweb-final.onrender.com'// production
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/api/reviews', reviewRouter);
app.use('/api/foods', foodRouter);
app.use('/api/otp', otpRoute);
app.use('/api/contact', mailRoute);
app.use('/api/forget', forgetRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/whishlist', whishlistRouter);

app.use('/api/im', imageRouter);
app.use('/api/analytics', analyticsRouter);

app.use('/api/cart', cartRouter);
app.use('/api/recipes', recipeRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/colors', colorRouter);
// ================== Serve React Frontend (local + prod) ==================
const frontendPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Debug
console.log('Mongo URI:', process.env.MONGO_URI);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
