import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, uploadSingleImage, uploadImage);

export default router;
