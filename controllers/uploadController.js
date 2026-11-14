import { uploadToCloudinary } from "../config/cloudinary.js";

/**
 * @desc    Upload an image file directly to Cloudinary
 * @route   POST /api/upload
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided in request.",
      });
    }

    const folder = req.body.folder || "dealdoko_users";
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully to Cloudinary!",
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image to Cloudinary.",
    });
  }
};
