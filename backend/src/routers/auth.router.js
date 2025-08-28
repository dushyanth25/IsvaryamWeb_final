import nodemailer from 'nodemailer';
import { Router } from 'express';
import handler from 'express-async-handler';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model.js';


dotenv.config();

const router = Router();

const otpStore = new Map();
const verifiedUsers = new Set();

// ===== Send OTP Endpoint =====
router.post(
  '/send-otp',
  handler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // ✅ Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists, please login!' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with 5-minute expiry
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      console.log(`Sending OTP to ${email}: ${otp}`);

      await transporter.sendMail({
        from: `"Isvaryam" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      });

      console.log('OTP email sent successfully');
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP email' });
    }
  })
);

// ===== Verify OTP Endpoint =====
router.post(
  '/verify-otp',
  handler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // ✅ Check if user already exists in DB
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists, please login!' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }

    const { otp: storedOtp, expiresAt } = record;

    if (Date.now() > expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpStore.delete(email);
    verifiedUsers.add(email);

    console.log(`OTP verified for ${email}`);
    res.json({ message: 'OTP verified successfully', verified: true });
  })
);

export default router;
export { verifiedUsers };
