import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";


/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
|
| Responsibilities:
|
| 1. Read the authentication token from the HTTP-only cookie.
| 2. Verify the JWT signature.
| 3. Verify that the token contains a valid user ID.
| 4. Load the current user from MongoDB.
| 5. Check whether the account still exists.
| 6. Check whether the account has been blocked.
| 7. Check whether the account is verified.
| 8. Attach the current user to req.user.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Default Cookie Name
|--------------------------------------------------------------------------
*/

const DEFAULT_COOKIE_NAME =
  "ecommerce_token";


/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
*/

const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Get Cookie Name
    |--------------------------------------------------------------------------
    */

    const cookieName =
      String(
        process.env.COOKIE_NAME ||
          DEFAULT_COOKIE_NAME
      ).trim() ||
      DEFAULT_COOKIE_NAME;


    /*
    |--------------------------------------------------------------------------
    | Read Authentication Cookie
    |--------------------------------------------------------------------------
    |
    | The cookie is HTTP-only, so normal browser JavaScript cannot access it.
    |
    |--------------------------------------------------------------------------
    */

    const token =
      req.cookies?.[cookieName];


    /*
    |--------------------------------------------------------------------------
    | No Token
    |--------------------------------------------------------------------------
    */

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Not authenticated. Please login first."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Validate JWT Secret
    |--------------------------------------------------------------------------
    */

    const jwtSecret =
      String(
        process.env.JWT_SECRET ||
          ""
      ).trim();

    if (!jwtSecret) {
      console.error(
        "JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication is not configured."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Verify JWT
    |--------------------------------------------------------------------------
    |
    | jwt.verify() checks:
    |
    | - Signature
    | - Expiration
    | - Token structure
    |
    |--------------------------------------------------------------------------
    */

    let decoded;

    try {
      decoded =
        jwt.verify(
          token,
          jwtSecret
        );
    } catch (error) {
      /*
       * Handle expired JWT separately.
       */

      if (
        error?.name ===
        "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Your session has expired. Please login again."
        });
      }


      /*
       * Any other JWT verification failure
       * means the token cannot be trusted.
       */

      if (
        error?.name ===
        "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authentication token."
        });
      }


      /*
       * Other JWT-related errors.
       */

      console.error(
        "JWT verification error:",
        error
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Validate Decoded Token
    |--------------------------------------------------------------------------
    |
    | We expect:
    |
    | {
    |   userId: "MongoDB ObjectId"
    | }
    |
    |--------------------------------------------------------------------------
    */

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Validate User ID
    |--------------------------------------------------------------------------
    |
    | Do not pass arbitrary values directly into MongoDB.
    |
    |--------------------------------------------------------------------------
    */

    const userId =
      String(
        decoded.userId
      ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Load Current User
    |--------------------------------------------------------------------------
    |
    | We query MongoDB on every authenticated request.
    |
    | This is important because the user's current state may have changed
    | after the JWT was issued.
    |
    | Example:
    |
    | User logs in
    |       ↓
    | JWT created
    |       ↓
    | Admin blocks user
    |       ↓
    | User makes another request
    |       ↓
    | Middleware sees isBlocked = true
    |       ↓
    | Request rejected
    |
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | isVerified must also be selected here because getMe() and other
    | authenticated controllers need the current verification state.
    |
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findById(
        userId
      ).select(
        "_id name email phone role isBlocked isVerified verificationMethod"
      );


    /*
    |--------------------------------------------------------------------------
    | User No Longer Exists
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account no longer exists."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Blocked User
    |--------------------------------------------------------------------------
    */

    if (
      user.isBlocked
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Attach Authenticated User
    |--------------------------------------------------------------------------
    |
    | Controllers can now access:
    |
    | req.user
    |
    |--------------------------------------------------------------------------
    */

    req.user = user;


    /*
    |--------------------------------------------------------------------------
    | Continue Request
    |--------------------------------------------------------------------------
    */

    return next();

  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );


    /*
    |--------------------------------------------------------------------------
    | Mongoose CastError
    |--------------------------------------------------------------------------
    */

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Unexpected Server Error
    |--------------------------------------------------------------------------
    */

    return res.status(500).json({
      success: false,
      message:
        "Authentication failed."
    });
  }
};


export default authMiddleware;