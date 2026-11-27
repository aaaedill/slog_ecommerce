
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  csrfProtection
} from "../middleware/csrfMiddleware.js";

import {
  getAllOrders,
  getOrderById,
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

router.use(authMiddleware);


// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

router.use(adminMiddleware);


// ============================================================
// GET ALL ORDERS
// ============================================================

// GET /api/admin/orders

router.get(
  "/",
  getAllOrders
);


// ============================================================
// GET SINGLE ORDER DETAILS
// ============================================================

// GET /api/admin/orders/:id
//
// Uses the existing MongoDB _id.
// No additional order ID is generated.

router.get(
  "/:id",
  getOrderById
);


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

// PATCH /api/admin/orders/:orderId/status

router.patch(
  "/:orderId/status",
  csrfProtection,
  updateOrderStatus
);


// ============================================================
// CANCEL ORDER
// ============================================================

// DELETE /api/admin/orders/:orderId

router.delete(
  "/:orderId",
  csrfProtection,
  cancelOrder
);


export default router;