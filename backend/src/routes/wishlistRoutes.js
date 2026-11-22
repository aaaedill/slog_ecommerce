import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  csrfProtection
} from "../middleware/csrfMiddleware.js";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} from "../controllers/wishlistController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
|
| Every wishlist endpoint requires the currently authenticated user.
|
|--------------------------------------------------------------------------
*/

router.use(
  authMiddleware
);

/*
|--------------------------------------------------------------------------
| GET WISHLIST
|--------------------------------------------------------------------------
|
| GET /api/wishlist
|
*/

router.get(
  "/",
  getWishlist
);

/*
|--------------------------------------------------------------------------
| ADD PRODUCT
|--------------------------------------------------------------------------
|
| POST /api/wishlist/:productId
|
*/

router.post(
  "/:productId",
  csrfProtection,
  addToWishlist
);

/*
|--------------------------------------------------------------------------
| CLEAR WISHLIST
|--------------------------------------------------------------------------
|
| DELETE /api/wishlist
|
*/

router.delete(
  "/",
  csrfProtection,
  clearWishlist
);

/*
|--------------------------------------------------------------------------
| REMOVE PRODUCT
|--------------------------------------------------------------------------
|
| DELETE /api/wishlist/:productId
|
*/

router.delete(
  "/:productId",
  csrfProtection,
  removeFromWishlist
);

export default router;