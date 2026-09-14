import { Readable } from "node:stream";

import getCloudinary from "../config/cloudinary.js";

// ============================================================
// UPLOAD PRODUCT IMAGE
// ============================================================

const uploadProductImage = async (
  req,
  res
) => {
  try {
    // ----------------------------------------------------------
    // Make sure a file was uploaded
    // ----------------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload."
      });
    }

    // ----------------------------------------------------------
    // Get configured Cloudinary instance
    // ----------------------------------------------------------

    const cloudinary =
      getCloudinary();

    // ----------------------------------------------------------
    // Upload the image buffer to Cloudinary
    // ----------------------------------------------------------

    const uploadResult =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "ecommerce/products",

                resource_type:
                  "image",

                use_filename:
                  false,

                unique_filename:
                  true,

                overwrite:
                  false
              },

              (
                error,
                result
              ) => {
                if (error) {
                  reject(error);

                  return;
                }

                resolve(result);
              }
            );

          // Convert the Multer buffer into
          // a readable stream and send it
          // to Cloudinary.
          Readable.from(
            req.file.buffer
          ).pipe(
            uploadStream
          );
        }
      );

    // ----------------------------------------------------------
    // Make sure Cloudinary returned the required information
    // ----------------------------------------------------------

    if (
      !uploadResult ||
      !uploadResult.secure_url ||
      !uploadResult.public_id
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Image upload completed but Cloudinary did not return a valid image URL."
      });
    }

    // ----------------------------------------------------------
    // Return image information to frontend
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Product image uploaded successfully.",

      image: {
        url:
          uploadResult.secure_url,

        publicId:
          uploadResult.public_id
      }
    });
  } catch (error) {
    console.error(
      "PRODUCT IMAGE UPLOAD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload product image."
    });
  }
};

export {
  uploadProductImage
};