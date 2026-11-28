
import express from "express";


import {
  register,
  verifyRegistrationOTP,
  resendRegistrationOTP,
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetPassword,
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
  registerRateLimiter,
  requestPasswordResetRateLimiter,
  verifyPasswordResetRateLimiter,
  resetPasswordRateLimiter
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
| Forgot Password
|--------------------------------------------------------------------------
|
| Forgot password remains public.
|
| The user submits their email address to request a
| password-reset OTP.
|
| A dedicated rate limiter protects this endpoint.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password",
  requestPasswordResetRateLimiter,
  requestPasswordReset
);


/*
|--------------------------------------------------------------------------
| Password Reset OTP Verification
|--------------------------------------------------------------------------
|
| The user submits their email address and OTP.
|
| If verification succeeds, the controller issues a
| short-lived password-reset authorization token.
|
| This endpoint remains public because the user is not
| authenticated yet.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/verify-reset-otp",
  verifyPasswordResetRateLimiter,
  verifyPasswordResetOTP
);


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
|
| The user submits the password-reset authorization token
| and their new password.
|
| The controller validates the token and updates the
| user's password.
|
| A dedicated rate limiter protects this endpoint.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/reset-password",
  resetPasswordRateLimiter,
  resetPassword
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