import express from 'express';
import { imageUploader } from '../utils/storage.js';

const router = express.Router();
router.post("/", imageUploader.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }
  const imageUrl = req.file.path;
  res.json({
    url: imageUrl,
  });
});

export default router;