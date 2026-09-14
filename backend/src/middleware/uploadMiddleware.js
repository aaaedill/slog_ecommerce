import multer from "multer";

// ============================================================
// MULTER CONFIGURATION
// ============================================================

// Store uploaded files temporarily in memory.
//
// We do this because the image will be sent directly from
// the backend to Cloudinary. We do not need to permanently
// save the uploaded file on the server.
const storage =
  multer.memoryStorage();

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (
  req,
  file,
  callback
) => {
  // Only allow image MIME types.
  //
  // This allows common formats such as:
  // - JPEG
  // - PNG
  // - WEBP
  // - GIF
  // - AVIF
  // - HEIC/HEIF when the browser reports them as images
  if (
    typeof file.mimetype !== "string" ||
    !file.mimetype.startsWith("image/")
  ) {
    return callback(
      new Error(
        "Only image files are allowed."
      ),
      false
    );
  }

  callback(null, true);
};

// ============================================================
// MULTER UPLOAD
// ============================================================

const uploadProductImage =
  multer({
    storage,

    fileFilter,

    limits: {
      // Maximum image size: 5 MB
      fileSize:
        5 * 1024 * 1024,

      // Only one image may be uploaded
      files: 1
    }
  }).single("image");

export default uploadProductImage;