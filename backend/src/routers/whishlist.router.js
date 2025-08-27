import { Router } from 'express';
import handler from 'express-async-handler';
import auth from '../middleware/auth.mid.js';
import { WishlistModel } from '../models/whishlist.model.js';

const router = Router();

// Add to wishlist
router.post(
  '/',
  handler(async (req, res) => {
    if (!req.user) {
      // User not logged in
      return res.status(401).json({ message: 'Please log in first' });
    }

    const { productId } = req.body;

    const wishlist = await WishlistModel.findOneAndUpdate(
      { userId: req.user.id, productId },
      { whishlist: true },
      { upsert: true, new: true }
    );

    res.status(201).json(wishlist);
  })
);

// Get all wishlist items for the logged-in user
router.get(
  '/',
  handler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please log in first' });
    }

    const items = await WishlistModel.find({ userId: req.user.id, whishlist: true })
      .populate('productId');
    res.json(items);
  })
);

// Remove from wishlist
router.delete(
  '/:productId',
  handler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please log in first' });
    }

    const { productId } = req.params;
    await WishlistModel.deleteOne({ userId: req.user.id, productId });
    res.json({ success: true });
  })
);

export default router;
