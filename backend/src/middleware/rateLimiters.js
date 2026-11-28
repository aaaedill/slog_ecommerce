
import rateLimit from "express-rate-limit";


/*
|--------------------------------------------------------------------------
| LOGIN RATE LIMITER
|--------------------------------------------------------------------------
|
| Limits repeated login attempts to protect user accounts.
|
*/

const loginRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes."
    }
  });


/*
|--------------------------------------------------------------------------
| REGISTRATION RATE LIMITER
|--------------------------------------------------------------------------
|
| Limits repeated registration attempts.
|
*/

const registerRateLimiter =
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many registration attempts. Please try again later."
    }
  });


/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD RATE LIMITER
|--------------------------------------------------------------------------
|
| Limits requests to send password-reset OTPs.
|
| Maximum:
| 5 requests per 15 minutes per IP.
|
*/

const requestPasswordResetRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many password reset requests. Please try again after 15 minutes."
    }
  });


/*
|--------------------------------------------------------------------------
| VERIFY PASSWORD RESET OTP RATE LIMITER
|--------------------------------------------------------------------------
|
| Limits attempts to verify password-reset OTPs.
|
| Maximum:
| 10 attempts per 15 minutes per IP.
|
| The PasswordReset model will also enforce
| its own OTP attempt limit.
|
*/

const verifyPasswordResetRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many OTP verification attempts. Please try again after 15 minutes."
    }
  });


/*
|--------------------------------------------------------------------------
| RESET PASSWORD RATE LIMITER
|--------------------------------------------------------------------------
|
| Limits attempts to submit a new password.
|
| Maximum:
| 5 requests per 15 minutes per IP.
|
*/

const resetPasswordRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many password reset attempts. Please try again after 15 minutes."
    }
  });


export {
  loginRateLimiter,
  registerRateLimiter,
  requestPasswordResetRateLimiter,
  verifyPasswordResetRateLimiter,
  resetPasswordRateLimiter
};