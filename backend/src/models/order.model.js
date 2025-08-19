import { model, Schema } from 'mongoose';
import { OrderStatus } from '../constants/orderStatus.js';

export const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'food', required: true }, // ✅ if your model is 'food'
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    name: { type: String, required: true },

    // ✅ make address an object instead of string
    address: {
      doorNumber: { type: String, required: true },
      street: { type: String },
      area: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String, required: true },
    },

    addressLatLng: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },

    paymentId: { type: String },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },       // ✅ new field
    couponCode: { type: String },                 // ✅ new field
    items: { type: [OrderItemSchema], required: true },

    status: { type: String, default: OrderStatus.NEW },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const OrderModel = model('order', orderSchema);
