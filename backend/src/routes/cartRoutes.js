import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  csrfProtection
} from "../middleware/csrfMiddleware.js";

import {

  getCart,

  addToCart,

  updateCartItem,

  removeFromCart,

  clearCart

} from "../controllers/cartController.js";

const router = express.Router();


// ============================================================

// ALL CART ROUTES REQUIRE AUTHENTICATION

// ============================================================

// Every route defined below this middleware requires:

//

// 1. A valid authentication cookie

// 2. A valid JWT

// 3. An existing user account

// 4. An account that is not blocked

//

// The authenticated user is available through req.user.

router.use(authMiddleware);


// ============================================================

// GET CART

// ============================================================

// Get the currently authenticated user's cart.

//

// The controller must use req.user._id / req.user.id

// rather than accepting a user ID from the client.

router.get(

  "/",

  getCart

);


// ============================================================

// ADD TO CART

// ============================================================

// Add a product to the currently authenticated user's cart.

//

// Product existence, size validation and quantity validation

// are handled by the cart controller.

router.post(

  "/",

  csrfProtection,

  addToCart

);


// ============================================================

// UPDATE CART ITEM

// ============================================================

// Update the quantity of an item in the currently

// authenticated user's cart.

router.put(

  "/",

  csrfProtection,

  updateCartItem

);


// ============================================================

// REMOVE CART ITEM

// ============================================================

// Remove one item from the currently authenticated user's cart.

router.delete(

  "/item",

  csrfProtection,

  removeFromCart

);


// ============================================================

// CLEAR CART

// ============================================================

// Remove all items from the currently authenticated user's cart.

router.delete(

  "/",

  csrfProtection,

  clearCart

);


export default router;