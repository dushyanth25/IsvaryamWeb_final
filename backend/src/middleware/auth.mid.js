import jwt from 'jsonwebtoken';
import { UNAUTHORIZED } from '../constants/httpStatus.js';
import { UserModel } from '../models/user.model.js';

const authMid = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(UNAUTHORIZED).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token received:', token);

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing');
    return res.status(500).json({ message: 'Server error: JWT secret missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token payload:', decoded);

    const user = await UserModel.findById(decoded.id).select('name email phone isAdmin');
    if (!user) {
      return res.status(UNAUTHORIZED).json({ message: 'Unauthorized: User not found' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    console.log('JWT verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(UNAUTHORIZED).json({ message: 'Unauthorized: Token expired' });
    }
    return res.status(UNAUTHORIZED).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default authMid;
