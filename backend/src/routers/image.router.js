import express from "express";
import { Image, Image2 } from "../models/image.model.js";

const router = express.Router();

// ✅ Route to fetch images based on screen type
router.get("/images", async (req, res) => {
  try {
    const { screen } = req.query; // 'mobile' or 'desktop'
    let images;

    if (screen === "mobile") {
      images = await Image2.find({}, "imageUrl");
    } else {
      images = await Image.find({}, "imageUrl");
    }

    const urls = images.map(img => img.imageUrl);
    res.json(urls);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

export default router;
