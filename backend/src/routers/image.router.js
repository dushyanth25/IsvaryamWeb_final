// color.router.js (or wherever your route is)
import express from "express";
import Color from "../models/image.model.js";  // your model

const router = express.Router();

router.get("/images", async (req, res) => {
  try {
    // Fetch only the `imageUrl` field
    const images = await Color.find({}, "imageUrl");

    // Return only array of image URLs
    const urls = images.map(img => img.imageUrl);

    res.json(urls);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

export default router;
