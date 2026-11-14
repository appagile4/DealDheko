import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["signup", "login", "reset"],
      default: "signup",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index: automatically deletes document when expiresAt timestamp arrives
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if OTP has passed the 1-minute expiration threshold
otpSchema.methods.isExpired = function () {
  return Date.now() > new Date(this.expiresAt).getTime();
};

export const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
