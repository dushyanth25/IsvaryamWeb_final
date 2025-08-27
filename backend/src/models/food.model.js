import mongoose from 'mongoose';
import { CartModel } from './cart.model.js';
import { OrderModel } from './order.model.js';
import { ReviewModel } from './review.model.js';
import { WishlistModel } from './whishlist.model.js';

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  category: { type: String },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true }
    }
  ],
  specifications: [
    {
      name: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  quantities: [
    {
      size: { type: String, required: true },   // e.g., '500ml', '1kg'
      price: { type: Number, required: true }   // price for this size
    }
  ],
  discount: { type: Number, default: 0 } // Discount percentage (0-100)
});

// ✅ Cascade delete hook
productSchema.pre('findOneAndDelete', async function (next) {
  try {
    const productId = this.getQuery()["_id"];

    if (productId) {
      await CartModel.updateMany({}, { $pull: { items: { productId } } });
      await OrderModel.updateMany({}, { $pull: { items: { product: productId } } });
      await ReviewModel.deleteMany({ productId });
      await WishlistModel.deleteMany({ productId });
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const FoodModel = mongoose.model('Product', productSchema);