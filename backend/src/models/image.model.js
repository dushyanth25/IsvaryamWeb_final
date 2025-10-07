// models/image.model.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
});

// For desktop
export const Image = mongoose.model("Image", imageSchema);

// For mobile
export const Image2 = mongoose.model("Image2", imageSchema);
