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

// ✅ Modified /login route with OTP fallback
router.post(
  '/login',
  handler(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      // ✅ Check if verified via OTP but not yet in DB
      if (verifiedUsers.has(email)) {
        // ✅ Create temporary user (optional)
        const tempUser = await UserModel.create({
          name: email.split('@')[0],
          email,
          password: '', // No password since it's OTP-based
        });

        verifiedUsers.delete(email);
        return res.send(generateTokenResponse(tempUser));
      }

      return res.status(BAD_REQUEST).send('User not found');
    }

    if (password) {
      if (
        typeof password !== 'string' ||
        typeof user.password !== 'string' ||
        !user.password
      ) {
        return res.status(BAD_REQUEST).send('Invalid credentials format');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(BAD_REQUEST).send('Username or password is invalid');
      }

      return res.send(generateTokenResponse(user));
    }

    if (verifiedUsers.has(email)) {
      verifiedUsers.delete(email); // ✅ Clear after use
      return res.send(generateTokenResponse(user));
    }

    return res.status(BAD_REQUEST).send('OTP not verified for this email');
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
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // app password
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
router.post(
  '/register',
  handler(async (req, res) => {
    const { name, email, password, address, phone } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(BAD_REQUEST).send('User already exists, please login!');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP temporarily (with expiry)
    await OTPModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      phone,
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
    });

    // Send OTP
    await sendOTPEmail(email, otp);

    res.send({ message: 'OTP sent to email. Please verify to complete registration.' });
  })
);

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

    // ✅ OTP valid
    await OTPModel.deleteMany({ email: email.toLowerCase() }); // cleanup

    res.send({ message: 'OTP verified successfully!' });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).send('Internal Server Error');
  }
});

// Profile update
// Updated Profile Update with Optional Password
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

    // ✅ Update password if provided and non-empty
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
router.post(
  '/send-otp',
  handler(async (req, res) => {
    const { email } = req.body;
console.log("Sending email:", email);

    if (!email) return res.status(400).send('Email is required!');

    const existingUser = await UserModel.findOne({ email });
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

  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.create({
      name,
      email,
      googleSignup: true,
      password: '', // No password for Google users
    });
  }

  res.send(generateTokenResponse(user));
});

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
