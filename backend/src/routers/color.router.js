import { Router } from "express";
import PageColor from "../models/color.model.js";



const router = Router();

// ✅ Helper to fetch a page color
const getColor = async (page) => {
  const entry = await PageColor.findOne({ page });
  return entry?.color || "#ffffff";
};

// 🎨 GET routes only

router.get("/colorhome", async (req, res) => {
  try {
    const color = await getColor("home");
    res.json({ color });
  } catch (err) {
    res.status(500).json({ error: "Failed to get home color", details: err });
  }
});

router.get("/colorprofile", async (req, res) => {
  try {
    const color = await getColor("profile");
    res.json({ color });
  } catch (err) {
    res.status(500).json({ error: "Failed to get profile color", details: err });
  }
});

router.get("/colorcart", async (req, res) => {
  try {
    const color = await getColor("cart");
    res.json({ color });
  } catch (err) {
    res.status(500).json({ error: "Failed to get cart color", details: err });
  }
});

router.get("/colorabout", async (req, res) => {
  try {
    const color = await getColor("about");
    res.json({ color });
  } catch (err) {
    res.status(500).json({ error: "Failed to get about color", details: err });
  }
});



router.get("/colorproduct", async (req, res) => {
  try {
    const color = await getColor("product");
    res.json({ color });
  } catch (err) {
    res.status(500).json({ error: "Failed to get product color", details: err });
  }
});
router.get("/colorheader", async (req, res) => {
    try {
        const color = await getColor('header');
        res.json({ color });
    } catch (err) {
        console.error("❌ Failed to get header color:", err);
        res.status(500).json({ error: 'Failed to get header color', details: err });
    }
});

router.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images' });
    }
});
export default router;
