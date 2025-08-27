import { model, Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Not required for Google users
    googleSignup: { type: Boolean, default: false },
    address: {
      doorNumber: { type: String, required: false },
      street: { type: String, required: false },
      area: { type: String, required: false },
      district: { type: String, required: false },
      state: { type: String, required: false },
      pincode: { type: String, required: false }
    },
    phone: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const UserModel = model('User', UserSchema);