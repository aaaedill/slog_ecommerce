import { v2 as cloudinary } from "cloudinary";

// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================

const getCloudinary = () => {
  const cloudName =
    String(
      process.env.CLOUDINARY_CLOUD_NAME ||
        ""
    ).trim();

  const apiKey =
    String(
      process.env.CLOUDINARY_API_KEY ||
        ""
    ).trim();

  const apiSecret =
    String(
      process.env.CLOUDINARY_API_SECRET ||
        ""
    ).trim();

  // ----------------------------------------------------------
  // Validate credentials
  // ----------------------------------------------------------

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret
  ) {
    throw new Error(
      "Cloudinary credentials are not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env."
    );
  }

  // ----------------------------------------------------------
  // Configure Cloudinary
  // ----------------------------------------------------------

  cloudinary.config({
    cloud_name: cloudName,

    api_key: apiKey,

    api_secret: apiSecret,

    secure: true
  });

  return cloudinary;
};

export default getCloudinary;