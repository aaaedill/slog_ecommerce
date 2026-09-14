import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getAllUsers,
  updateUser
} from "../controllers/adminUserController.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Admin User Routes
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

// Verify the authentication cookie and JWT.
//
// authMiddleware also:
// - Verifies the JWT
// - Checks that the user still exists
// - Checks that the account is not blocked
// - Attaches the authenticated user to req.user

router.use(authMiddleware);


// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

// Verify that the authenticated user has administrator
// privileges before allowing access to any route below.

router.use(adminMiddleware);


// ============================================================
// GET ALL USERS
// ============================================================

// GET /api/admin/users
//
// Returns the users that the administrator is allowed to see.
//
// The controller must never return password hashes or other
// sensitive authentication information.

router.get(
  "/",
  getAllUsers
);


// ============================================================
// BLOCK / UNBLOCK USER
// ============================================================

// PATCH /api/admin/users/:id
//
// Allows an administrator to block or unblock a user.
//
// The controller is responsible for validating:
//
// - The supplied MongoDB user ID
// - The requested isBlocked value
// - Whether the target user exists
// - Whether the target user is allowed to be blocked

router.patch(
  "/:id",
  updateUser
);


export default router;