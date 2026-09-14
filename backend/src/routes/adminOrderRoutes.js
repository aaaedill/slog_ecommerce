import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/adminOrderController.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Admin Order Routes
|--------------------------------------------------------------------------
|
| Every route in this file requires:
|
| 1. A valid logged-in user
| 2. A valid authentication cookie
| 3. An existing user account
| 4. The account must not be blocked
| 5. role === "admin"
|
*/


// ============================================================
// AUTHENTICATION
// ============================================================

// First verify that the request contains a valid
// authentication cookie and that the user still exists.
//
// authMiddleware also rejects blocked users.

router.use(authMiddleware);


// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

// After authentication, verify that the authenticated
// user has the admin role.

router.use(adminMiddleware);


// ============================================================
// GET ALL ORDERS
// ============================================================

// GET /api/admin/orders
//
// Returns all orders for the admin dashboard.
//
// Only authenticated administrators can access this route.

router.get(
  "/",
  getAllOrders
);


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

// PATCH /api/admin/orders/:orderId/status
//
// Updates the status of an order.
//
// The controller is responsible for validating:
//
// - The order ID
// - The requested status
// - Allowed order-status transitions
// - Whether the order can still be changed

router.patch(
  "/:orderId/status",
  updateOrderStatus
);


// ============================================================
// CANCEL ORDER
// ============================================================

// DELETE /api/admin/orders/:orderId
//
// Cancels an order from the admin dashboard.
//
// The controller is responsible for validating:
//
// - The order ID
// - Whether the order exists
// - Whether the order is eligible for cancellation

router.delete(
  "/:orderId",
  cancelOrder
);


export default router;