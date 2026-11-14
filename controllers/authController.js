import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../config/nodemailer.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "dealdoko_classifieds_nepal_jwt_secret_token_2026_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Set JWT Cookie
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

/**
 * @desc    Register a new user & send 1-minute OTP
 * @route   POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your full name, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // If user exists but is unverified, update credentials
    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;
      if (phone) existingUser.phone = phone;
      if (city) existingUser.city = city;
      await existingUser.save();
    } else {
      // Create new user (unverified until OTP is confirmed)
      existingUser = await User.create({
        name,
        email: cleanEmail,
        password,
        phone: phone || "+977 98412 34567",
        city: city || "Kathmandu",
        isVerified: false,
      });
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Exactly 1 minute (60 seconds) expiration timestamp
    const expiresAt = new Date(Date.now() + 60 * 1000);

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Save new OTP
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      type: "signup",
      expiresAt,
    });

    // Send OTP via Nodemailer
    try {
      await sendOtpEmail(cleanEmail, otpCode, name);
    } catch (mailError) {
      console.error("Nodemailer Send Error:", mailError);
      return res.status(500).json({
        success: false,
        message: "Failed to deliver OTP email. Please verify your email address.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email. Expires in 1 minute (60 seconds).",
      email: cleanEmail,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration.",
    });
  }
};

/**
 * @desc    Verify OTP & activate account
 * @route   POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and OTP code.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find the latest OTP for this email
    const otpDoc = await Otp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "No active OTP found. The code may have expired after 1 minute. Please click 'Resend OTP'.",
      });
    }

    // Strict 1-minute expiration check
    if (otpDoc.isExpired() || Date.now() > new Date(otpDoc.expiresAt).getTime()) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "This OTP code expired after 1 minute. Please click 'Resend OTP' to get a new code.",
      });
    }

    // Validate OTP match
    if (otpDoc.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    // Find and verify user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please register again.",
      });
    }

    user.isVerified = true;
    await user.save();

    // Clean up used OTP
    await Otp.deleteMany({ email: cleanEmail });

    // Return JWT token and user profile
    sendTokenResponse(user, 200, res, "Email verified successfully! Welcome to DealDoko.");
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during OTP verification.",
    });
  }
};

/**
 * @desc    Resend OTP with fresh 1-minute expiration
 * @route   POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to resend OTP.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    // Generate fresh 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Exactly 1 minute (60 seconds) expiration timestamp
    const expiresAt = new Date(Date.now() + 60 * 1000);

    // Delete prior OTPs
    await Otp.deleteMany({ email: cleanEmail });

    // Save new OTP
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      type: user.isVerified ? "login" : "signup",
      expiresAt,
    });

    // Send email
    await sendOtpEmail(cleanEmail, otpCode, user.name);

    res.status(200).json({
      success: true,
      message: "A fresh OTP code has been sent to your email. Expires in 1 minute.",
      email: cleanEmail,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP. Please try again.",
    });
  }
};

/**
 * @desc    Login user with email & password
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for user and include password for validation
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // If account not verified yet, send fresh OTP and require verification
    if (!user.isVerified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 60 * 1000);

      await Otp.deleteMany({ email: cleanEmail });
      await Otp.create({
        email: cleanEmail,
        otp: otpCode,
        type: "signup",
        expiresAt,
      });

      await sendOtpEmail(cleanEmail, otpCode, user.name);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Your email is not verified yet. We just sent a 6-digit OTP (expires in 1 min) to your email.",
        email: cleanEmail,
        expiresIn: 60,
      });
    }

    sendTokenResponse(user, 200, res, "Welcome back to DealDoko!");
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login.",
    });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
};

/**
 * @desc    Update user profile settings
 * @route   PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, about, phone, city, avatar, isGoogleLinked } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Email cannot be changed
    if (req.body.email && req.body.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address cannot be changed as it is your permanent verified account identifier.",
      });
    }

    if (name) user.name = name.trim();
    if (about !== undefined) user.about = about.trim();
    if (phone) user.phone = phone.trim();
    if (city) user.city = city.trim();
    if (avatar) user.avatar = avatar;
    if (isGoogleLinked !== undefined) user.isGoogleLinked = isGoogleLinked;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

/**
 * @desc    Upload profile image to Cloudinary and store URL on MongoDB
 * @route   POST /api/auth/avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided in request.",
      });
    }

    // 1. Upload buffer directly to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "dealdoko_avatars");

    // 2. Find authenticated user in MongoDB and save Cloudinary URL
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image successfully uploaded to Cloudinary and saved to MongoDB!",
      url: result.secure_url,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        about: user.about,
        isVerified: user.isVerified,
        isGoogleLinked: user.isGoogleLinked,
      },
    });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile image to Cloudinary.",
    });
  }
};
