// models/deliveryCharge.model.js
import mongoose from "mongoose";

const deliveryChargeSchema = new mongoose.Schema({
  fromState: { type: String, required: true },
  toState: { type: String, required: true },
  charge: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("DeliveryCharge", deliveryChargeSchema);
