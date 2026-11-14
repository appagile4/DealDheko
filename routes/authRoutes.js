import express from "express";
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, uploadSingleImage, uploadAvatar);

export default router;
