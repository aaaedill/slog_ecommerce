import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getOrders,
  placeOrder,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();


// ============================================================
// AUTHENTICATION
// ============================================================

// Every order route requires:
//
// 1. A valid authentication cookie
// 2. A valid JWT
// 3. An existing user account
// 4. An account that is not blocked
//
// authMiddleware also attaches the authenticated user
// to req.user.

router.use(authMiddleware);


// ============================================================
// GET USER ORDERS
// ============================================================

// GET /api/orders
//
// Returns orders belonging to the currently authenticated user.
//
// The controller must determine the user from req.user
// rather than trusting a user ID supplied by the client.

router.get(
  "/",
  getOrders
);


// ============================================================
// PLACE ORDER
// ============================================================

// POST /api/orders
//
// Creates an order for the currently authenticated user.
//
// The controller is responsible for:
//
// - Validating the cart
// - Validating products
// - Validating sizes
// - Validating quantities
// - Calculating the order total on the server
// - Validating the delivery address
// - Validating the payment method
// - Creating the order for req.user

router.post(
  "/",
  placeOrder
);


// ============================================================
// CANCEL ORDER
// ============================================================

// PATCH /api/orders/:orderId/cancel
//
// Allows the authenticated owner of an order to request
// cancellation.
//
// The controller is responsible for verifying:
//
// - The order exists
// - The order belongs to req.user
// - The order is still eligible for cancellation

router.patch(
  "/:orderId/cancel",
  cancelOrder
);


export default router;