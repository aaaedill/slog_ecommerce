import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import User from "../models/User.js";


/*
|--------------------------------------------------------------------------
| Authentication Configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_COOKIE_NAME =
  "ecommerce_token";

const DEFAULT_JWT_EXPIRES_IN =
  "7d";

const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_MAX_LENGTH = 200;

const NAME_MAX_LENGTH = 100;

const EMAIL_MAX_LENGTH = 254;


/*
|--------------------------------------------------------------------------
| Email Validation
|--------------------------------------------------------------------------
*/

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/*
|--------------------------------------------------------------------------
| Password Validation
|--------------------------------------------------------------------------
|
| Requires:
|
| - At least 8 characters
| - At least one lowercase letter
| - At least one number
|
|--------------------------------------------------------------------------
*/

const passwordRegex =
  /^(?=.*[a-z])(?=.*\d).{8,}$/;


/*
|--------------------------------------------------------------------------
| Create JWT
|--------------------------------------------------------------------------
*/

const createToken = (
  userId
) => {

  const jwtSecret =
    String(
      process.env.JWT_SECRET || ""
    ).trim();


  if (!jwtSecret) {

    throw new Error(
      "JWT_SECRET is not configured."
    );

  }


  return jwt.sign(
    {
      userId: String(userId)
    },
    jwtSecret,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        DEFAULT_JWT_EXPIRES_IN
    }
  );
};


/*
|--------------------------------------------------------------------------
| Cookie Options
|--------------------------------------------------------------------------
|
| Development:
| - httpOnly
| - secure: false
| - sameSite: lax
|
| Production:
| - httpOnly
| - secure: true
| - sameSite: none
|
| Production uses SameSite=None because the frontend and backend
| may be hosted on different domains.
|
|--------------------------------------------------------------------------
*/

const getCookieOptions = () => {

  const isProduction =
    process.env.NODE_ENV ===
    "production";


  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction
      ? "none"
      : "lax",

    maxAge:
      7 *
      24 *
      60 *
      60 *
      1000,

    path: "/"
  };
};


/*
|--------------------------------------------------------------------------
| Get Cookie Name
|--------------------------------------------------------------------------
*/

const getCookieName = () => {

  return (
    String(
      process.env.COOKIE_NAME ||
        DEFAULT_COOKIE_NAME
    ).trim() ||
    DEFAULT_COOKIE_NAME
  );
};


/*
|--------------------------------------------------------------------------
| Build Safe User Response
|--------------------------------------------------------------------------
|
| Never return:
|
| - password
| - password hash
| - internal authentication data
|
|--------------------------------------------------------------------------
*/

const formatUser = (
  user
) => {

  return {
    id: String(user._id),

    name: user.name,

    email: user.email,

    role: user.role,

    isBlocked: user.isBlocked
  };
};


/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export const register = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password
    } = req.body || {};


    /*
     * Normalize input.
     */

    const cleanName =
      String(
        name || ""
      ).trim();


    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    const cleanPassword =
      String(
        password || ""
      );


    /*
     * Required field validation.
     */

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPassword
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Please fill all fields"
      });

    }


    /*
     * Name validation.
     */

    if (
      cleanName.length < 2
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Name must be at least 2 characters"
      });

    }


    if (
      cleanName.length >
      NAME_MAX_LENGTH
    ) {

      return res.status(400).json({
        success: false,

        message:
          `Name cannot exceed ${NAME_MAX_LENGTH} characters`
      });

    }


    /*
     * Email validation.
     */

    if (
      cleanEmail.length >
      EMAIL_MAX_LENGTH
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Email address is too long"
      });

    }


    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Please enter a valid email address"
      });

    }


    /*
     * Password validation.
     */

    if (
      cleanPassword.length <
      PASSWORD_MIN_LENGTH
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Password must be at least 8 characters and include lowercase letter and number"
      });

    }


    if (
      cleanPassword.length >
      PASSWORD_MAX_LENGTH
    ) {

      return res.status(400).json({
        success: false,

        message:
          `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`
      });

    }


    if (
      !passwordRegex.test(
        cleanPassword
      )
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Password must be at least 8 characters and include lowercase letter and number"
      });

    }


    /*
     * Check whether the email already exists.
     */

    const existingUser =
      await User.findOne({
        email: cleanEmail
      });


    if (existingUser) {

      return res.status(409).json({
        success: false,

        message:
          "Email already taken"
      });

    }


    /*
     * Hash password.
     *
     * bcrypt cost factor 12 provides strong password hashing
     * while remaining practical for a normal e-commerce backend.
     */

    const hashedPassword =
      await bcrypt.hash(
        cleanPassword,
        12
      );


    /*
     * IMPORTANT:
     *
     * Public registration can ONLY create a normal user.
     *
     * The client cannot choose:
     *
     * role: "admin"
     *
     * Admin accounts are created separately through createAdmin.js.
     */

    const user =
      await User.create({
        name: cleanName,

        email: cleanEmail,

        password: hashedPassword,

        role: "user",

        isBlocked: false
      });


    /*
     * Return safe user information.
     *
     * No password or password hash is returned.
     */

    return res.status(201).json({

      success: true,

      message:
        "Account Created Successfully",

      user:
        formatUser(user)
    });

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    /*
     * Duplicate email.
     */

    if (
      error?.code === 11000
    ) {

      return res.status(409).json({
        success: false,

        message:
          "Email already taken"
      });

    }


    /*
     * Mongoose validation error.
     */

    if (
      error?.name ===
      "ValidationError"
    ) {

      const validationErrors =
        Object.values(
          error.errors || {}
        ).map(
          (validationError) =>
            validationError.message
        );


      return res.status(400).json({

        success: false,

        message:
          "Registration validation failed",

        errors:
          validationErrors

      });

    }


    /*
     * Unexpected server error.
     */

    return res.status(500).json({

      success: false,

      message:
        "Error creating account"

    });

  }

};


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password
    } = req.body || {};


    /*
     * Normalize input.
     */

    const cleanEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    const cleanPassword =
      String(
        password || ""
      );


    /*
     * Required field validation.
     */

    if (
      !cleanEmail ||
      !cleanPassword
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Please fill all fields"
      });

    }


    /*
     * Email validation.
     */

    if (
      cleanEmail.length >
        EMAIL_MAX_LENGTH ||
      !emailRegex.test(
        cleanEmail
      )
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Please enter a valid email address"
      });

    }


    /*
     * Password length validation.
     *
     * We intentionally do not require the registration
     * password pattern here because existing users may have
     * been created under an older password policy.
     *
     * bcrypt comparison remains the final authentication check.
     */

    if (
      cleanPassword.length <
        PASSWORD_MIN_LENGTH ||
      cleanPassword.length >
        PASSWORD_MAX_LENGTH
    ) {

      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password"
      });

    }


    /*
     * Find user.
     *
     * Password normally has select: false in User.js.
     *
     * We explicitly request it here because bcrypt.compare()
     * needs the stored password hash.
     */

    const user =
      await User.findOne({
        email: cleanEmail
      }).select(
        "+password"
      );


    /*
     * Do not reveal whether the email exists.
     */

    if (!user) {

      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password"
      });

    }


    /*
     * Check blocked status.
     */

    if (
      user.isBlocked
    ) {

      return res.status(403).json({
        success: false,

        message:
          "Your account has been blocked by admin"
      });

    }


    /*
     * Compare entered password with bcrypt hash.
     */

    const passwordMatches =
      await bcrypt.compare(
        cleanPassword,
        user.password
      );


    if (
      !passwordMatches
    ) {

      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password"
      });

    }


    /*
     * Make sure JWT configuration exists.
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
          "Authentication configuration error"
      });

    }


    /*
     * Create JWT.
     */

    const token =
      createToken(
        user._id
      );


    /*
     * Set secure HTTP-only authentication cookie.
     *
     * JavaScript in the browser cannot read this cookie.
     */

    res.cookie(
      getCookieName(),

      token,

      getCookieOptions()
    );


    /*
     * Return safe user information.
     */

    return res.status(200).json({

      success: true,

      message:
        "Login successful",

      user:
        formatUser(user)

    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    /*
     * JWT configuration error.
     */

    if (
      error?.message ===
      "JWT_SECRET is not configured."
    ) {

      return res.status(500).json({
        success: false,

        message:
          "Authentication configuration error"
      });

    }


    /*
     * Unexpected server error.
     */

    return res.status(500).json({

      success: false,

      message:
        "Login failed"

    });

  }

};


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logout = async (
  req,
  res
) => {

  try {

    /*
     * Use the exact same cookie name and
     * compatible options used during login.
     */

    res.clearCookie(
      getCookieName(),
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/"
      }
    );


    return res.status(200).json({

      success: true,

      message:
        "Logged out successfully"

    });

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Logout failed"

    });

  }

};


/*
|--------------------------------------------------------------------------
| GET CURRENT LOGGED-IN USER
|--------------------------------------------------------------------------
|
| The authentication middleware should already have verified
| the JWT and attached the user to req.user.
|
|--------------------------------------------------------------------------
*/

export const getMe = async (
  req,
  res
) => {

  try {

    /*
     * No authenticated user means the JWT middleware
     * did not provide a valid session.
     */

    if (!req.user) {

      return res.status(401).json({
        success: false,

        message:
          "Please login first"
      });

    }


    /*
     * Check whether the account has been blocked.
     *
     * This is important because an admin can block a user
     * after the user has already logged in.
     */

    if (
      req.user.isBlocked
    ) {

      return res.status(403).json({
        success: false,

        message:
          "Your account has been blocked by admin"
      });

    }


    /*
     * Return safe user information.
     */

    return res.status(200).json({

      success: true,

      user:
        formatUser(
          req.user
        )

    });

  } catch (error) {

    console.error(
      "Get current user error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to load profile"

    });

  }

};