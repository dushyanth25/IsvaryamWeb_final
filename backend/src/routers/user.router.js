import { Router } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
const router = Router();
import { BAD_REQUEST } from '../constants/httpStatus.js';
import handler from 'express-async-handler';
import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import auth from '../middleware/auth.mid.js';
import admin from '../middleware/admin.mid.js';
import { generateTokenResponse } from '../utils/generateToken.js';
import { verifiedUsers } from './auth.router.js'; // ✅ Import OTP map
import { OTPModel } from '../models/OTPModel.js'; // temp model for OTP storage

const PASSWORD_HASH_SALT_ROUNDS = 10;

// ✅ Fixed /login route (no temp user creation)
router.post(
  '/login',
  handler(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(BAD_REQUEST).send('User not found. Please register first.');
    }

    // If password login
    if (password) {
      if (!user.password) {
        return res.status(BAD_REQUEST).send('This account does not have a password set. Please use OTP login or Google.');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(BAD_REQUEST).send('Email or password is invalid');
      }

      return res.send(generateTokenResponse(user));
    }

    // If OTP login
    if (verifiedUsers.has(email)) {
      verifiedUsers.delete(email); // ✅ Clear OTP flag
      return res.send(generateTokenResponse(user));
    }

    return res.status(BAD_REQUEST).send('Invalid login attempt. Please provide password or verify OTP.');
  })
);

// OTP generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// Send OTP via email
async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Isvaryam" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
}

// --- Register Route ---
// In the register route
router.post(
  '/register',
  handler(async (req, res) => {
    console.log('Register request received:', req.body);
    
    const { name, email, password, address, phone } = req.body;

    // Check if all required fields are present
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(BAD_REQUEST).send('Missing required fields');
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      console.log('User already exists:', email);
      return res.status(BAD_REQUEST).send('User already exists, please login!');
    }

    try {
      const hashedPassword = await bcrypt.hash(
        password,
        PASSWORD_HASH_SALT_ROUNDS
      );

      const newUser = {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        phone,
      };

      console.log('Creating new user:', newUser);
      const result = await UserModel.create(newUser);
      console.log('User created successfully:', result._id);
      
      res.send(generateTokenResponse(result));
    } catch (error) {
      console.error('Registration error:', error);
      res.status(BAD_REQUEST).send('Registration failed');
    }
  })
);

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Verifying OTP:", email, otp);

    if (!email || !otp) {
      return res.status(400).send('Email and OTP are required!');
    }

    const record = await OTPModel.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).send('OTP not found!');
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).send('OTP expired!');
    }

    if (record.otp !== otp) {
      return res.status(400).send('Invalid OTP!');
    }

    // ✅ OTP valid → create permanent user if not exists
    let user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await UserModel.create({
        name: record.name || email.split('@')[0],
        email: record.email,
        password: record.password, // hashed password
        address: record.address,
        phone: record.phone,
      });
    }

    await OTPModel.deleteMany({ email: email.toLowerCase() });

    res.send({
      message: 'OTP verified successfully!',
      ...generateTokenResponse(user),
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).send('Internal Server Error');
  }
});

// Profile update
router.put(
  '/updateProfile',
  auth,
  handler(async (req, res) => {
    const { name, address, phone, password } = req.body;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      res.status(BAD_REQUEST).send('User not found');
      return;
    }

    user.name = name || user.name;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    if (password && typeof password === 'string' && password.trim() !== '') {
      user.password = await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);
    }

    await user.save();
    res.send(generateTokenResponse(user));
  })
);

// Change password
router.put(
  '/changePassword',
  auth,
  handler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      res.status(BAD_REQUEST).send('Change Password Failed!');
      return;
    }

    const equal = await bcrypt.compare(currentPassword, user.password);
    if (!equal) {
      res.status(BAD_REQUEST).send('Current Password Is Not Correct!');
      return;
    }

    user.password = await bcrypt.hash(newPassword, PASSWORD_HASH_SALT_ROUNDS);
    await user.save();

    res.send('Password changed successfully');
  })
);

// Send OTP (for signup)
router.post(
  '/send-otp',
  handler(async (req, res) => {
    const { email } = req.body;
    console.log("Sending email:", email);

    if (!email) return res.status(400).send('Email is required!');

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(BAD_REQUEST).send('User already exists, please login!');
    }

    const otp = generateOTP();

    await OTPModel.create({
      email: email.toLowerCase(),
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendOTPEmail(email, otp);

    res.send({ message: 'OTP sent successfully!' });
  })
);

// Google signup
router.post('/google-signup', async (req, res) => {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  let user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      googleSignup: true,
      password: '', // Google users don't have password
    });
  }

  res.send(generateTokenResponse(user));
});

// Profile
router.get(
  '/profile',
  auth,
  handler(async (req, res) => {
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(BAD_REQUEST).send('User not found');
    }
    res.send(user);
  })
);

export default router;