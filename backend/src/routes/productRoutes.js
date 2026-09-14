import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();


// ============================================================
// PUBLIC PRODUCT ROUTES
// ============================================================

// Anyone can view all products.
router.get(
  "/",
  getProducts
);

// Anyone can view a single product.
router.get(
  "/:id",
  getProductById
);


// ============================================================
// ADMIN PRODUCT ROUTES
// ============================================================

// Creating, updating and deleting products requires:
//
// 1. A valid login
// 2. A valid authentication cookie
// 3. An existing user account
// 4. role === "admin"
// 5. The account must not be blocked

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);


export default router;