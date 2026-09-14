import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import uploadProductImage from "../middleware/uploadMiddleware.js";

import {
  uploadProductImage as uploadProductImageController
} from "../controllers/uploadController.js";

// ============================================================
// ROUTER
// ============================================================

const router =
  express.Router();

// ============================================================
// PRODUCT IMAGE UPLOAD
// ============================================================

// Admin authentication is required.
//
// The request must contain a multipart/form-data
// file with the field name:
//
// image
//
// Example:
// FormData.append("image", file)
router.post(
  "/product-image",
  authMiddleware,
  adminMiddleware,
  uploadProductImage,
  uploadProductImageController
);

export default router;