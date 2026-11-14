import User from "../models/User.js";
import Advertisement from "../models/Advertisement.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import jwt from "jsonwebtoken";
import { getIO } from "../config/socket.js";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "dealdoko_classifieds_nepal_jwt_secret_token_2026_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * @desc    Dedicated Superadmin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    // STRICT ROLE CHECK: Only superadmin allowed
    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Regular user accounts cannot access administrative portals.",
      });
    }

    if (user.isSuspended || user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This administrative account is suspended.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Superadmin authenticated successfully.",
      token,
      user: userObj,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during administrative authentication.",
    });
  }
};

/**
 * @desc    Get real-time Superadmin Dashboard Statistics
 * @route   GET /api/admin/stats
 * @access  Private (Superadmin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalAds, pendingAds, approvedAds, rejectedAds, totalUsers] =
      await Promise.all([
        Advertisement.countDocuments(),
        Advertisement.countDocuments({ status: "pending" }),
        Advertisement.countDocuments({ status: "approved" }),
        Advertisement.countDocuments({ status: "rejected" }),
        User.countDocuments({ role: "user" }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAds,
        pendingAds,
        approvedAds,
        rejectedAds,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

/**
 * @desc    Get advertisements for admin review (with status filter and pagination)
 * @route   GET /api/admin/advertisements
 * @access  Private (Superadmin)
 */
export const getAdminAdvertisements = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (category && category !== "all") {
      filter.category = category.toLowerCase().trim();
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { "sellerContact.name": { $regex: search.trim(), $options: "i" } },
        { "location.city": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Advertisement.countDocuments(filter);
    const advertisements = await Advertisement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("seller", "name email phone city avatar isVerified createdAt")
      .populate("approvedBy", "name email");

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      advertisements,
    });
  } catch (error) {
    console.error("Admin Advertisements Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advertisements.",
    });
  }
};

/**
 * @desc    Approve an advertisement (Makes it publicly visible across DealDoko)
 * @route   PUT /api/admin/advertisements/:id/approve
 * @access  Private (Superadmin)
 */
export const approveAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    ad.status = "approved";
    ad.approvedBy = req.user._id;
    ad.approvedAt = new Date();
    ad.rejectionReason = "";

    await ad.save();

    // 1. Audit Log Entry
    await AuditLog.create({
      admin: req.user._id,
      action: "ad_approved",
      targetType: "advertisement",
      targetId: ad._id,
      metadata: {
        title: ad.title,
        sellerId: ad.seller?._id,
        approvedAt: ad.approvedAt,
      },
    });

    // 2. Create Notification in MongoDB for Seller
    if (ad.seller) {
      const notification = await Notification.create({
        recipient: ad.seller._id,
        type: "ad_approved",
        title: "Advertisement Approved! 🎉",
        message: `Congratulations! Your advertisement "${ad.title}" has been approved and is now live on DealDoko.`,
        relatedAdvertisement: ad._id,
      });

      // 3. Emit real-time notification to seller's user socket room
      try {
        const io = getIO();
        if (io) {
          io.to(`user_${ad.seller._id}`).emit("notification:new", notification);
          io.to(`user_${ad.seller._id}`).emit("ad:status_updated", {
            adId: ad._id,
            status: "approved",
            title: ad.title,
          });
        }
      } catch {
        // socket emit non-fatal
      }
    }

    res.status(200).json({
      success: true,
      message: `Advertisement "${ad.title}" has been approved and published to the marketplace.`,
      advertisement: ad,
    });
  } catch (error) {
    console.error("Approve Ad Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve advertisement.",
    });
  }
};

/**
 * @desc    Reject an advertisement with reason
 * @route   PUT /api/admin/advertisements/:id/reject
 * @access  Private (Superadmin)
 */
export const rejectAdvertisement = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required to inform the seller.",
      });
    }

    const ad = await Advertisement.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    ad.status = "rejected";
    ad.rejectionReason = reason.trim();
    ad.approvedBy = undefined;
    ad.approvedAt = undefined;

    await ad.save();

    // 1. Audit Log Entry
    await AuditLog.create({
      admin: req.user._id,
      action: "ad_rejected",
      targetType: "advertisement",
      targetId: ad._id,
      metadata: {
        title: ad.title,
        sellerId: ad.seller?._id,
        reason: ad.rejectionReason,
      },
    });

    // 2. Create Notification in MongoDB for Seller
    if (ad.seller) {
      const notification = await Notification.create({
        recipient: ad.seller._id,
        type: "ad_rejected",
        title: "Advertisement Review Update",
        message: `Your advertisement "${ad.title}" was not approved. Reason: ${ad.rejectionReason}. You may edit and resubmit your advertisement.`,
        relatedAdvertisement: ad._id,
      });

      // 3. Emit real-time notification to seller's user socket room
      try {
        const io = getIO();
        if (io) {
          io.to(`user_${ad.seller._id}`).emit("notification:new", notification);
          io.to(`user_${ad.seller._id}`).emit("ad:status_updated", {
            adId: ad._id,
            status: "rejected",
            title: ad.title,
            reason: ad.rejectionReason,
          });
        }
      } catch {
        // socket emit non-fatal
      }
    }

    res.status(200).json({
      success: true,
      message: `Advertisement "${ad.title}" has been rejected. The seller has been notified.`,
      advertisement: ad,
    });
  } catch (error) {
    console.error("Reject Ad Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject advertisement.",
    });
  }
};

/**
 * @desc    Toggle featured status for an approved advertisement
 * @route   PUT /api/admin/advertisements/:id/featured
 * @access  Private (Superadmin)
 */
export const toggleAdFeatured = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    ad.isFeatured = !ad.isFeatured;
    await ad.save();

    res.status(200).json({
      success: true,
      message: `Advertisement featured status updated to ${ad.isFeatured}.`,
      isFeatured: ad.isFeatured,
      advertisement: ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status.",
    });
  }
};

/**
 * @desc    Get registered users list with advertisement stats
 * @route   GET /api/admin/users
 * @access  Private (Superadmin)
 */
export const getAdminUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute ad counts per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const adCount = await Advertisement.countDocuments({ seller: u._id });
        return {
          ...u.toObject(),
          adCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

/**
 * @desc    Toggle suspend / activate user account
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Superadmin)
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({
        success: false,
        message: "Superadmin accounts cannot be suspended.",
      });
    }

    user.isSuspended = !user.isSuspended;
    user.status = user.isSuspended ? "suspended" : "active";
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: user.isSuspended ? "user_suspended" : "user_activated",
      targetType: "user",
      targetId: user._id,
      metadata: { name: user.name, email: user.email },
    });

    res.status(200).json({
      success: true,
      message: `User account has been ${user.status}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};

/**
 * @desc    Get recent Admin Audit Logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Superadmin)
 */
export const getAdminAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("admin", "name email avatar");

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs.",
    });
  }
};
