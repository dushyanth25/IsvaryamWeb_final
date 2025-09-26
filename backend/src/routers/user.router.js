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
// ✅ Get all users (Admin only)
router.get(
  '/',
  auth,     // Auth middleware
  admin,    // Admin-only middleware
  handler(async (req, res) => {
    const users = await UserModel.find().select('-password'); // Exclude passwords
    res.send(users);
  })
);

// ✅ Block/unblock a user (Admin only)
router.patch(
  '/:id/block',
  auth,
  admin,
  handler(async (req, res) => {
    const { id } = req.params;
    const { block } = req.body; // block = true or false

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).send('User not found');

    user.isBlocked = !!block;
    await user.save();

    res.send({ message: `User ${block ? 'blocked' : 'unblocked'} successfully`, user });
  })
);

export default router;
