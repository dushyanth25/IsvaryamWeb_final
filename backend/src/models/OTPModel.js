// models/OTPModel.js
import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // expires in 5 minutes (TTL index)
  },
});

export const OTPModel = mongoose.model("OTP", OTPSchema);
