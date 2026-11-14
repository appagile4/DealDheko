import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getAdminAdvertisements,
  approveAdvertisement,
  rejectAdvertisement,
  toggleAdFeatured,
  getAdminUsers,
  toggleUserStatus,
  getAdminAuditLogs,
} from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dedicated Admin Login (Public)
router.post("/login", adminLogin);

// Protected Admin Routes (Requires valid JWT & superadmin role)
router.use(protect);
router.use(requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/advertisements", getAdminAdvertisements);
router.put("/advertisements/:id/approve", approveAdvertisement);
router.put("/advertisements/:id/reject", rejectAdvertisement);
router.put("/advertisements/:id/featured", toggleAdFeatured);
router.get("/users", getAdminUsers);
router.put("/users/:id/status", toggleUserStatus);
router.get("/audit-logs", getAdminAuditLogs);

export default router;
