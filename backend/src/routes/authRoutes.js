import express from "express";


import {
  register,
  verifyRegistrationOTP,
  resendRegistrationOTP,
  login,
  logout,
  getMe
} from "../controllers/authController.js";


import authMiddleware from "../middleware/authMiddleware.js";


import {
  csrfProtection
} from "../middleware/csrfMiddleware.js";


import {
  loginRateLimiter,
  registerRateLimiter
} from "../middleware/rateLimiters.js";


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| Registration
|--------------------------------------------------------------------------
|
| Registration remains public.
|
| CSRF protection is intentionally not required here because
| registration does not depend on an existing authenticated
| JWT cookie.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  registerRateLimiter,
  register
);


/*
|--------------------------------------------------------------------------
| OTP Verification
|--------------------------------------------------------------------------
|
| OTP verification remains public.
|
| The user is not authenticated yet at this stage, so the
| authenticated-session CSRF protection is not required.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/verify-otp",
  verifyRegistrationOTP
);


/*
|--------------------------------------------------------------------------
| Resend OTP
|--------------------------------------------------------------------------
|
| Resending the registration OTP remains public.
|
| The user is not authenticated yet at this stage.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/resend-otp",
  resendRegistrationOTP
);


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
|
| Login remains public.
|
| CSRF protection is intentionally not required here because
| authentication has not yet been established.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginRateLimiter,
  login
);


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
|
| Logout changes the authenticated session by removing the
| JWT authentication cookie.
|
| Therefore it must be protected against CSRF.
|
| Middleware order:
|
| 1. CSRF validation
| 2. JWT authentication
| 3. Logout controller
|
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  csrfProtection,
  authMiddleware,
  logout
);


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
|
| GET is a safe/read-only request, so the CSRF middleware
| does not need to be applied here.
|
| Authentication is still required.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authMiddleware,
  getMe
);


/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

export default router;