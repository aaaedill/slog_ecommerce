/*
|--------------------------------------------------------------------------
| AUTH CONTROLLER
|--------------------------------------------------------------------------
|
| This controller handles:
|
| 1. Customer registration
| 2. OTP generation and delivery
| 3. OTP verification
| 4. OTP resend
| 5. Customer login
| 6. Customer logout
| 7. Current authenticated user
|
|--------------------------------------------------------------------------
|
| Registration flow:
|
| Name
| Email OR Indian phone number
| Password
|       ↓
| Unverified account
|       ↓
| OTP
|       ↓
| OTP verification
|       ↓
| Verified account
|       ↓
| Login allowed
|
|--------------------------------------------------------------------------
*/

import bcrypt from "bcryptjs";

import crypto from "crypto";

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import PasswordReset from "../models/PasswordReset.js";

import {
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  createOTPData,
  sendEmailOTP,
  sendPasswordResetOTP,
  sendSMSOTP,
  verifyOTP
} from "../services/otpService.js";


/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const DEFAULT_COOKIE_NAME = "ecommerce_token";

const DEFAULT_JWT_EXPIRES_IN = "7d";

const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_MAX_LENGTH = 200;

const NAME_MAX_LENGTH = 100;

const EMAIL_MAX_LENGTH = 254;

const PHONE_LENGTH = 10;

const OTP_RESEND_COOLDOWN_SECONDS = 60;


/*
|--------------------------------------------------------------------------
| Regular Expressions
|--------------------------------------------------------------------------
*/

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*\d).{8,}$/;

const indianPhoneRegex =
  /^[6-9]\d{9}$/;


/*
|--------------------------------------------------------------------------
| Helper: Create JWT
|--------------------------------------------------------------------------
|
| The JWT contains only the user ID.
|
| No password, email, phone number, or other sensitive information
| is placed inside the token.
|
|--------------------------------------------------------------------------
*/

const createToken = (userId) => {

  const jwtSecret =
    process.env.JWT_SECRET;

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
| Helper: Cookie Options
|--------------------------------------------------------------------------
*/

const getCookieOptions = () => {

  const isProduction =
    process.env.NODE_ENV === "production";

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
| Helper: Cookie Name
|--------------------------------------------------------------------------
*/

const getCookieName = () => {

  return (
    process.env.COOKIE_NAME ||
    DEFAULT_COOKIE_NAME
  );

};


/*
|--------------------------------------------------------------------------
| Helper: Format User
|--------------------------------------------------------------------------
|
| Never send password, OTP hash, OTP attempts, OTP expiry,
| or other internal authentication fields to the frontend.
|
|--------------------------------------------------------------------------
*/

const formatUser = (user) => {

  return {

    id:
      String(user._id),

    name:
      user.name,

    email:
      user.email || null,

    phone:
      user.phone || null,

    role:
      user.role,

    isBlocked:
      user.isBlocked,

    isVerified:
      user.isVerified,

    verificationMethod:
      user.verificationMethod || null

  };

};


/*
|--------------------------------------------------------------------------
| Helper: Normalize Indian Phone Number
|--------------------------------------------------------------------------
|
| Accepted input examples:
|
| 9876543210
| +919876543210
| 919876543210
|
| Internally the database stores:
|
| 9876543210
|
|--------------------------------------------------------------------------
*/

const normalizeIndianPhone = (value) => {

  if (
    value === undefined ||
    value === null
  ) {

    return null;

  }

  let phone =
    String(value)
      .trim()
      .replace(/\D/g, "");


  /*
  |--------------------------------------------------------------------------
  | Remove Indian country code
  |--------------------------------------------------------------------------
  */

  if (
    phone.startsWith("91") &&
    phone.length === 12
  ) {

    phone =
      phone.slice(2);

  }


  /*
  |--------------------------------------------------------------------------
  | Validate Indian mobile number
  |--------------------------------------------------------------------------
  */

  if (
    phone.length !== PHONE_LENGTH ||
    !indianPhoneRegex.test(phone)
  ) {

    return null;

  }

  return phone;

};


/*
|--------------------------------------------------------------------------
| Helper: Detect Email OR Phone
|--------------------------------------------------------------------------
|
| The registration form has ONE combined field.
|
| Example:
|
| emailOrPhone = "customer@gmail.com"
|
| OR
|
| emailOrPhone = "9876543210"
|
|--------------------------------------------------------------------------
*/

const parseEmailOrPhone = (value) => {

  if (
    value === undefined ||
    value === null
  ) {

    return {

      type: null,

      value: null

    };

  }

  const input =
    String(value).trim();


  /*
  |--------------------------------------------------------------------------
  | Empty input
  |--------------------------------------------------------------------------
  */

  if (!input) {

    return {

      type: null,

      value: null

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Email
  |--------------------------------------------------------------------------
  */

  if (
    input.includes("@") &&
    input.length <= EMAIL_MAX_LENGTH &&
    emailRegex.test(input)
  ) {

    return {

      type: "email",

      value:
        input.toLowerCase()

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Indian Phone
  |--------------------------------------------------------------------------
  */

  const phone =
    normalizeIndianPhone(input);

  if (phone) {

    return {

      type: "phone",

      value: phone

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Invalid
  |--------------------------------------------------------------------------
  */

  return {

    type: null,

    value: null

  };

};


/*
|--------------------------------------------------------------------------
| Helper: Get Verification Target
|--------------------------------------------------------------------------
*/

const getVerificationTarget = (user) => {

  if (
    user.verificationMethod === "email" &&
    user.email
  ) {

    return {

      type: "email",

      value: user.email

    };

  }


  if (
    user.verificationMethod === "phone" &&
    user.phone
  ) {

    return {

      type: "phone",

      value: user.phone

    };

  }


  return {

    type: null,

    value: null

  };

};


/*
|--------------------------------------------------------------------------
| Helper: Check OTP Resend Cooldown
|--------------------------------------------------------------------------
*/

const getRemainingResendSeconds = (
  otpLastSentAt
) => {

  if (!otpLastSentAt) {

    return 0;

  }

  const lastSentTime =
    new Date(
      otpLastSentAt
    ).getTime();

  const now =
    Date.now();

  const elapsedSeconds =
    Math.floor(
      (now - lastSentTime) /
      1000
    );

  const remaining =
    OTP_RESEND_COOLDOWN_SECONDS -
    elapsedSeconds;

  return Math.max(
    remaining,
    0
  );

};


/*
|--------------------------------------------------------------------------
| Helper: Send Verification OTP
|--------------------------------------------------------------------------
|
| Generates and stores the OTP hash and then sends the plain OTP
| to the customer's email or phone.
|
|--------------------------------------------------------------------------
*/

const sendVerificationOTP = async (
  user
) => {

  const target =
    getVerificationTarget(user);


  if (
    !target.type ||
    !target.value
  ) {

    throw new Error(
      "No valid verification method is configured for this account."
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Generate OTP
  |--------------------------------------------------------------------------
  */

  const {
    otp,
    otpHash,
    otpExpiresAt
  } =
    await createOTPData();


  /*
  |--------------------------------------------------------------------------
  | Send OTP
  |--------------------------------------------------------------------------
  |
  | We send the OTP before saving the new hash.
  |
  | This prevents a failed provider request from replacing a previously
  | working OTP.
  |
  |--------------------------------------------------------------------------
  */

  if (
    target.type === "email"
  ) {

    await sendEmailOTP({

      email:
        target.value,

      name:
        user.name,

      otp

    });

  }


  if (
    target.type === "phone"
  ) {

    await sendSMSOTP({

      phone:
        target.value,

      otp

    });

  }


  /*
  |--------------------------------------------------------------------------
  | Save OTP Security Data
  |--------------------------------------------------------------------------
  */

  user.otpHash =
    otpHash;

  user.otpExpiresAt =
    otpExpiresAt;

  user.otpAttempts =
    0;

  user.otpLastSentAt =
    new Date();

  await user.save();


  /*
  |--------------------------------------------------------------------------
  | Return Only Safe Information
  |--------------------------------------------------------------------------
  */

  return {

    type:
      target.type,

    expiresInMinutes:
      OTP_EXPIRY_MINUTES

  };

};


/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
|
| Creates a new unverified customer account.
|
| Expected request body:
|
| {
|   "name": "John Doe",
|   "emailOrPhone": "john@example.com",
|   "password": "password123"
| }
|
| OR:
|
| {
|   "name": "John Doe",
|   "emailOrPhone": "9876543210",
|   "password": "password123"
| }
|
|--------------------------------------------------------------------------
*/

const register = async (
  req,
  res
) => {

  try {

    const {
      name,
      emailOrPhone,
      password
    } =
      req.body;


    /*
    |--------------------------------------------------------------------------
    | Basic Required Validation
    |--------------------------------------------------------------------------
    */

    if (
      typeof name !== "string" ||
      typeof emailOrPhone !== "string" ||
      typeof password !== "string"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, email or phone number, and password are required."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Clean Name
    |--------------------------------------------------------------------------
    */

    const cleanName =
      name
        .trim()
        .replace(/\s+/g, " ");


    /*
    |--------------------------------------------------------------------------
    | Validate Name
    |--------------------------------------------------------------------------
    */

    if (!cleanName) {

      return res.status(400).json({

        success: false,

        message:
          "Name is required."

      });

    }


    if (
      cleanName.length >
      NAME_MAX_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Name cannot exceed ${NAME_MAX_LENGTH} characters.`

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Parse Email OR Phone
    |--------------------------------------------------------------------------
    */

    const parsed =
      parseEmailOrPhone(
        emailOrPhone
      );


    if (
      !parsed.type ||
      !parsed.value
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please enter a valid email address or Indian mobile number."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Password Length
    |--------------------------------------------------------------------------
    */

    if (
      password.length <
      PASSWORD_MIN_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`

      });

    }


    if (
      password.length >
      PASSWORD_MAX_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Password Strength
    |--------------------------------------------------------------------------
    |
    | Password must contain:
    |
    | - At least one lowercase letter
    | - At least one number
    | - At least 8 characters
    |
    |--------------------------------------------------------------------------
    */

    if (
      !passwordRegex.test(password)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Password must contain at least one lowercase letter and one number."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Check Existing Account
    |--------------------------------------------------------------------------
    */

    const existingUser =
      parsed.type === "email"

        ? await User.findOne({

            email:
              parsed.value

          })

        : await User.findOne({

            phone:
              parsed.value

          });


    if (existingUser) {


      /*
      |--------------------------------------------------------------------------
      | Already Verified
      |--------------------------------------------------------------------------
      */

      if (
        existingUser.isVerified
      ) {

        return res.status(409).json({

          success: false,

          message:
            parsed.type === "email"

              ? "An account with this email already exists."

              : "An account with this phone number already exists."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Existing Unverified Account
      |--------------------------------------------------------------------------
      |
      | We allow the customer to continue verification instead of creating
      | multiple accounts with the same email/phone.
      |
      | IMPORTANT:
      |
      | We intentionally DO NOT change existingUser.role here.
      |
      | This preserves an existing admin role instead of accidentally
      | converting an admin account into a normal user.
      |
      |--------------------------------------------------------------------------
      */

      const remainingSeconds =
        getRemainingResendSeconds(
          existingUser.otpLastSentAt
        );


      if (
        remainingSeconds > 0
      ) {

        return res.status(409).json({

          success: false,

          message:
            "An unverified account already exists. Please use the OTP that was sent to you.",

          requiresVerification:
            true,

          userId:
            String(
              existingUser._id
            ),

          verificationMethod:
            existingUser.verificationMethod,

          resendAvailableIn:
            remainingSeconds

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Update Existing Unverified Account
      |--------------------------------------------------------------------------
      */

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      existingUser.name =
        cleanName;

      existingUser.password =
        passwordHash;

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT ROLE PROTECTION
      |--------------------------------------------------------------------------
      |
      | DO NOT set:
      |
      | existingUser.role = "user";
      |
      | The existing account keeps its current role.
      |
      |--------------------------------------------------------------------------
      */

      existingUser.isBlocked =
        false;

      existingUser.isVerified =
        false;

      existingUser.verificationMethod =
        parsed.type;


      /*
      |--------------------------------------------------------------------------
      | Clear Old OTP
      |--------------------------------------------------------------------------
      */

      existingUser.otpHash =
        undefined;

      existingUser.otpExpiresAt =
        undefined;

      existingUser.otpAttempts =
        0;

      existingUser.otpLastSentAt =
        undefined;

      await existingUser.save();


      /*
      |--------------------------------------------------------------------------
      | Send New OTP
      |--------------------------------------------------------------------------
      */

      try {

        await sendVerificationOTP(
          existingUser
        );

      } catch (otpError) {

        console.error(

          "OTP delivery failed during registration:",

          otpError.message

        );

        return res.status(503).json({

          success: false,

          message:
            "Your account was created, but we could not send the verification OTP. Please try again."

        });

      }


      return res.status(201).json({

        success: true,

        message:
          parsed.type === "email"

            ? "Verification OTP sent to your email address."

            : "Verification OTP sent to your phone number.",

        requiresVerification:
          true,

        userId:
          String(
            existingUser._id
          ),

        verificationMethod:
          parsed.type

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Hash Password
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    /*
    |--------------------------------------------------------------------------
    | Build User Data
    |--------------------------------------------------------------------------
    |
    | Only a genuinely NEW account receives the default "user" role.
    |
    |--------------------------------------------------------------------------
    */

    const userData = {

      name:
        cleanName,

      password:
        passwordHash,

      role:
        "user",

      isBlocked:
        false,

      isVerified:
        false,

      verificationMethod:
        parsed.type

    };


    /*
    |--------------------------------------------------------------------------
    | Add Email OR Phone
    |--------------------------------------------------------------------------
    */

    if (
      parsed.type === "email"
    ) {

      userData.email =
        parsed.value;

    }


    if (
      parsed.type === "phone"
    ) {

      userData.phone =
        parsed.value;

    }


    /*
    |--------------------------------------------------------------------------
    | Create Account
    |--------------------------------------------------------------------------
    */

    const user =
      await User.create(
        userData
      );


    /*
    |--------------------------------------------------------------------------
    | Send Verification OTP
    |--------------------------------------------------------------------------
    */

    try {

      await sendVerificationOTP(
        user
      );

    } catch (otpError) {


      /*
      |--------------------------------------------------------------------------
      | OTP Delivery Failed
      |--------------------------------------------------------------------------
      |
      | We do NOT expose provider credentials or internal errors.
      |
      | The unverified account remains in the database so the user can
      | request another OTP once the provider is available.
      |
      |--------------------------------------------------------------------------
      */

      console.error(

        "OTP delivery failed during registration:",

        otpError.message

      );

      return res.status(503).json({

        success: false,

        message:
          "Your account was created, but we could not send the verification OTP. Please try again."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Registration Successful
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({

      success: true,

      message:
        parsed.type === "email"

          ? "Verification OTP sent to your email address."

          : "Verification OTP sent to your phone number.",

      requiresVerification:
        true,

      userId:
        String(
          user._id
        ),

      verificationMethod:
        parsed.type

    });


  } catch (error) {


    /*
    |--------------------------------------------------------------------------
    | Duplicate Key Error
    |--------------------------------------------------------------------------
    */

    if (
      error?.code === 11000
    ) {

      return res.status(409).json({

        success: false,

        message:
          "An account with these details already exists."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Mongoose Validation Error
    |--------------------------------------------------------------------------
    */

    if (
      error?.name ===
      "ValidationError"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid registration details.",

        errors:
          Object.values(
            error.errors || {}
          ).map(
            (item) =>
              item.message
          )

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Unexpected Error
    |--------------------------------------------------------------------------
    */

    console.error(

      "Register error:",

      error

    );

    return res.status(500).json({

      success: false,

      message:
        "Registration failed. Please try again later."

    });

  }

};


/*
|--------------------------------------------------------------------------
| VERIFY OTP
|--------------------------------------------------------------------------
|
| Expected request body:
|
| {
|   "userId": "...",
|   "otp": "123456"
| }
|
|--------------------------------------------------------------------------
*/

const verifyRegistrationOTP =
  async (
    req,
    res
  ) => {

    try {

      const {
        userId,
        otp
      } =
        req.body;


      /*
      |--------------------------------------------------------------------------
      | Validate Request
      |--------------------------------------------------------------------------
      */

      if (
        typeof userId !== "string" ||
        typeof otp !== "string"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "User ID and OTP are required."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Validate OTP Format
      |--------------------------------------------------------------------------
      */

      if (
        !/^\d{6}$/.test(
          otp.trim()
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "OTP must be a 6-digit number."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Find User
      |--------------------------------------------------------------------------
      |
      | OTP fields use select:false in the User model, so we explicitly
      | request them here.
      |
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findById(
          userId
        ).select(
          "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt"
        );


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "Account not found."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Already Verified
      |--------------------------------------------------------------------------
      */

      if (
        user.isVerified
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This account is already verified."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Check OTP
      |--------------------------------------------------------------------------
      */

      const result =
        await verifyOTP({

          otp:
            otp.trim(),

          otpHash:
            user.otpHash,

          otpExpiresAt:
            user.otpExpiresAt,

          otpAttempts:
            user.otpAttempts || 0

        });


      /*
      |--------------------------------------------------------------------------
      | Invalid OTP
      |--------------------------------------------------------------------------
      */

      if (
        !result.success
      ) {


        /*
        |--------------------------------------------------------------------------
        | Increase Attempt Counter
        |--------------------------------------------------------------------------
        */

        if (
          result.reason ===
            "INVALID_OTP" ||

          result.reason ===
            "OTP_NOT_FOUND"
        ) {

          user.otpAttempts =
            (user.otpAttempts || 0) + 1;

          await user.save();

        }


        /*
        |--------------------------------------------------------------------------
        | Maximum Attempts
        |--------------------------------------------------------------------------
        */

        if (
          result.reason ===
          "MAX_ATTEMPTS"
        ) {

          return res.status(429).json({

            success: false,

            message:
              "Too many incorrect OTP attempts. Please request a new OTP."

          });

        }


        /*
        |--------------------------------------------------------------------------
        | Expired OTP
        |--------------------------------------------------------------------------
        */

        if (
          result.reason ===
          "OTP_EXPIRED"
        ) {

          return res.status(400).json({

            success: false,

            message:
              "This OTP has expired. Please request a new OTP."

          });

        }


        /*
        |--------------------------------------------------------------------------
        | Invalid OTP
        |--------------------------------------------------------------------------
        */

        return res.status(400).json({

          success: false,

          message:
            "Invalid OTP."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Mark Account As Verified
      |--------------------------------------------------------------------------
      */

      user.isVerified =
        true;


      /*
      |--------------------------------------------------------------------------
      | Clear OTP Data
      |--------------------------------------------------------------------------
      |
      | Once verification succeeds, the OTP must no longer be usable.
      |
      |--------------------------------------------------------------------------
      */

      user.otpHash =
        undefined;

      user.otpExpiresAt =
        undefined;

      user.otpAttempts =
        0;

      user.otpLastSentAt =
        undefined;


      await user.save();


      /*
      |--------------------------------------------------------------------------
      | Return Safe User
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({

        success: true,

        message:
          "Account verified successfully. You can now log in.",

        user:
          formatUser(user)

      });


    } catch (error) {


      /*
      |--------------------------------------------------------------------------
      | Invalid MongoDB ID
      |--------------------------------------------------------------------------
      */

      if (
        error?.name ===
        "CastError"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid user ID."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Unexpected Error
      |--------------------------------------------------------------------------
      */

      console.error(

        "Verify OTP error:",

        error

      );

      return res.status(500).json({

        success: false,

        message:
          "OTP verification failed. Please try again later."

      });

    }

  };


/*
|--------------------------------------------------------------------------
| RESEND OTP
|--------------------------------------------------------------------------
|
| Expected request body:
|
| {
|   "userId": "..."
| }
|
|--------------------------------------------------------------------------
*/

const resendRegistrationOTP =
  async (
    req,
    res
  ) => {

    try {

      const {
        userId
      } =
        req.body;


      /*
      |--------------------------------------------------------------------------
      | Validate User ID
      |--------------------------------------------------------------------------
      */

      if (
        typeof userId !== "string" ||
        !userId.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "User ID is required."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Find User
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findById(
          userId
        ).select(
          "+otpHash +otpExpiresAt +otpAttempts +otpLastSentAt"
        );


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "Account not found."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Already Verified
      |--------------------------------------------------------------------------
      */

      if (
        user.isVerified
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This account is already verified."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Check Resend Cooldown
      |--------------------------------------------------------------------------
      */

      const remainingSeconds =
        getRemainingResendSeconds(
          user.otpLastSentAt
        );


      if (
        remainingSeconds > 0
      ) {

        return res.status(429).json({

          success: false,

          message:
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`,

          resendAvailableIn:
            remainingSeconds

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Send New OTP
      |--------------------------------------------------------------------------
      */

      try {

        await sendVerificationOTP(
          user
        );

      } catch (otpError) {

        console.error(

          "OTP resend failed:",

          otpError.message

        );

        return res.status(503).json({

          success: false,

          message:
            "We could not send the OTP right now. Please try again later."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({

        success: true,

        message:
          user.verificationMethod ===
          "email"

            ? "A new verification OTP has been sent to your email address."

            : "A new verification OTP has been sent to your phone number.",

        verificationMethod:
          user.verificationMethod,

        expiresInMinutes:
          OTP_EXPIRY_MINUTES

      });


    } catch (error) {


      /*
      |--------------------------------------------------------------------------
      | Invalid MongoDB ID
      |--------------------------------------------------------------------------
      */

      if (
        error?.name ===
        "CastError"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid user ID."

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Unexpected Error
      |--------------------------------------------------------------------------
      */

      console.error(

        "Resend OTP error:",

        error

      );

      return res.status(500).json({

        success: false,

        message:
          "Could not resend OTP. Please try again later."

      });

    }

  };


/*
|--------------------------------------------------------------------------
| REQUEST PASSWORD RESET
|--------------------------------------------------------------------------
|
| Sends a password-reset OTP to an existing, verified email account.
|
| The response is deliberately generic so callers cannot discover
| whether an email address is registered on the website.
|
| Expected request body:
|
| {
|   "email": "customer@example.com"
| }
|
|--------------------------------------------------------------------------
*/

const requestPasswordReset = async (
  req,
  res
) => {

  try {

    const {
      email
    } =
      req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate Email
    |--------------------------------------------------------------------------
    */

    if (
      typeof email !== "string" ||
      !email.trim() ||
      email.trim().length > EMAIL_MAX_LENGTH ||
      !emailRegex.test(email.trim())
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please enter a valid email address."

      });

    }


    const normalizedEmail =
      email.trim().toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | Generic Response
    |--------------------------------------------------------------------------
    */

    const genericResponse = {

      success: true,

      message:
        "If an account exists with this email address, a password reset code will be sent shortly."

    };


    /*
    |--------------------------------------------------------------------------
    | Find Verified Account
    |--------------------------------------------------------------------------
    |
    | Unverified accounts cannot use password reset.
    | The same generic response is returned either way.
    |
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findOne({

        email:
          normalizedEmail,

        isVerified:
          true

      });


    if (!user) {

      return res.status(200).json(
        genericResponse
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Check Resend Cooldown
    |--------------------------------------------------------------------------
    |
    | A new OTP can be requested after 60 seconds.
    | Keep the response generic to avoid account enumeration.
    |
    |--------------------------------------------------------------------------
    */

    const existingReset =
      await PasswordReset.findOne({

        email:
          normalizedEmail

      });


    if (existingReset?.lastSentAt) {

      const elapsedSeconds =
        Math.floor(
          (Date.now() - new Date(existingReset.lastSentAt).getTime()) / 1000
        );

      if (
        elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS
      ) {

        return res.status(200).json(
          genericResponse
        );

      }

    }


    /*
    |--------------------------------------------------------------------------
    | Generate OTP
    |--------------------------------------------------------------------------
    */

    const {
      otp,
      otpHash,
      otpExpiresAt
    } =
      await createOTPData();


    /*
    |--------------------------------------------------------------------------
    | Send Password Reset Email
    |--------------------------------------------------------------------------
    |
    | Send before replacing an existing reset record so a provider
    | failure does not invalidate a previously delivered OTP.
    |
    |--------------------------------------------------------------------------
    */

    await sendPasswordResetOTP({

      email:
        user.email,

      name:
        user.name,

      otp

    });


    /*
    |--------------------------------------------------------------------------
    | Save Password Reset Data
    |--------------------------------------------------------------------------
    |
    | The plain OTP is never stored in MongoDB.
    | cleanupAt is also used by the model's TTL index.
    | Expiry is checked manually during verification as well.
    |
    |--------------------------------------------------------------------------
    */

    await PasswordReset.findOneAndUpdate(

      {
        email:
          normalizedEmail
      },

      {
        $set: {

          userId:
            user._id,

          email:
            normalizedEmail,

          otpHash,

          otpExpiresAt,

          otpAttempts:
            0,

          lastSentAt:
            new Date(),

          cleanupAt:
            otpExpiresAt

        },

        $unset: {

          resetTokenHash: 1,

          resetTokenExpiresAt: 1,

          verifiedAt: 1

        }

      },

      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }

    );


    return res.status(200).json(
      genericResponse
    );


  } catch (error) {

    console.error(

      "Request password reset error:",

      error

    );

    return res.status(200).json({

      success: true,

      message:
        "If an account exists with this email address, a password reset code will be sent shortly."

    });

  }

};


/*
|--------------------------------------------------------------------------
| VERIFY PASSWORD RESET OTP
|--------------------------------------------------------------------------
|
| Verifies the email OTP and creates a short-lived reset authorization.
|
| Expected request body:
|
| {
|   "email": "customer@example.com",
|   "otp": "123456"
| }
|
|--------------------------------------------------------------------------
*/

const verifyPasswordResetOTP = async (
  req,
  res
) => {

  try {

    const {
      email,
      otp
    } =
      req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate Input
    |--------------------------------------------------------------------------
    */

    if (
      typeof email !== "string" ||
      !email.trim() ||
      email.trim().length > EMAIL_MAX_LENGTH ||
      !emailRegex.test(email.trim()) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "A valid email address and six-digit OTP are required."

      });

    }


    const normalizedEmail =
      email.trim().toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | Find Reset Record
    |--------------------------------------------------------------------------
    */

    const resetRecord =
      await PasswordReset.findOne({

        email:
          normalizedEmail

      }).select(
        "+otpHash +resetTokenHash"
      );


    if (!resetRecord) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid or expired verification code. Please request a new code."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Verify OTP
    |--------------------------------------------------------------------------
    */

    const result =
      await verifyOTP({

        otp,

        otpHash:
          resetRecord.otpHash,

        otpExpiresAt:
          resetRecord.otpExpiresAt,

        otpAttempts:
          resetRecord.otpAttempts || 0

      });


    if (!result.success) {

      /*
      |--------------------------------------------------------------------------
      | Increase Failed Attempt Counter
      |--------------------------------------------------------------------------
      */

      if (
        result.reason === "INVALID_OTP" ||
        result.reason === "OTP_NOT_FOUND"
      ) {

        await PasswordReset.updateOne(

          {
            _id:
              resetRecord._id,

            otpHash:
              resetRecord.otpHash

          },

          {
            $inc: {
              otpAttempts: 1
            }
          }

        );

      }


      if (
        result.reason === "MAX_ATTEMPTS"
      ) {

        return res.status(429).json({

          success: false,

          message:
            "Too many incorrect verification attempts. Please request a new code."

        });

      }


      if (
        result.reason === "OTP_EXPIRED"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This verification code has expired. Please request a new code."

        });

      }


      return res.status(400).json({

        success: false,

        message:
          "Invalid verification code."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Create Secure Reset Token
    |--------------------------------------------------------------------------
    |
    | The raw token is returned once to the frontend.
    | Only its SHA-256 hash is stored in MongoDB.
    |
    |--------------------------------------------------------------------------
    */

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    const resetTokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const resetTokenExpiresAt =
      new Date(
        Date.now() + 15 * 60 * 1000
      );

    const verifiedAt =
      new Date();


    /*
    |--------------------------------------------------------------------------
    | Atomically Consume OTP
    |--------------------------------------------------------------------------
    |
    | The OTP hash is removed in the same database operation that
    | creates the reset authorization. This prevents the same OTP
    | from being exchanged for multiple reset tokens concurrently.
    |
    |--------------------------------------------------------------------------
    */

    const updatedRecord =
      await PasswordReset.findOneAndUpdate(

        {
          _id:
            resetRecord._id,

          otpHash:
            resetRecord.otpHash,

          otpAttempts: {
            $lt: OTP_MAX_ATTEMPTS
          },

          otpExpiresAt: {
            $gt: new Date()
          }

        },

        {
          $set: {

            resetTokenHash,

            resetTokenExpiresAt,

            verifiedAt,

            cleanupAt:
              resetTokenExpiresAt,

            otpAttempts:
              0

          },

          $unset: {

            otpHash: 1,

            otpExpiresAt: 1

          }

        },

        {
          new: true
        }

      );


    if (!updatedRecord) {

      return res.status(400).json({

        success: false,

        message:
          "This verification code is no longer valid. Please request a new code."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Verification Successful
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({

      success: true,

      message:
        "Email verified successfully. You can now reset your password.",

      resetToken,

      expiresInMinutes:
        15

    });


  } catch (error) {

    console.error(

      "Verify password reset OTP error:",

      error

    );

    return res.status(500).json({

      success: false,

      message:
        "Could not verify the code. Please try again later."

    });

  }

};


/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
|
| Validates the one-time reset authorization and updates the password.
|
| Expected request body:
|
| {
|   "resetToken": "...",
|   "password": "newPassword123"
| }
|
|--------------------------------------------------------------------------
*/

const resetPassword = async (
  req,
  res
) => {

  try {

    const {
      resetToken,
      password
    } =
      req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate Reset Token
    |--------------------------------------------------------------------------
    */

    if (
      typeof resetToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(resetToken)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "A valid password reset authorization is required. Please verify your email again."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate New Password
    |--------------------------------------------------------------------------
    */

    if (typeof password !== "string") {

      return res.status(400).json({

        success: false,

        message:
          "A new password is required."

      });

    }


    if (
      password.length < PASSWORD_MIN_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`

      });

    }


    if (
      password.length > PASSWORD_MAX_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`

      });

    }


    if (!passwordRegex.test(password)) {

      return res.status(400).json({

        success: false,

        message:
          "Password must contain at least one lowercase letter and one number."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Hash Reset Token
    |--------------------------------------------------------------------------
    */

    const resetTokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    /*
    |--------------------------------------------------------------------------
    | Find Valid Reset Authorization
    |--------------------------------------------------------------------------
    */

    const resetRecord =
      await PasswordReset.findOne({

        resetTokenHash,

        resetTokenExpiresAt: {
          $gt: new Date()
        },

        verifiedAt: {
          $ne: null
        }

      }).select(
        "+resetTokenHash"
      );


    if (!resetRecord) {

      return res.status(400).json({

        success: false,

        message:
          "Your password reset session is invalid or has expired. Please start again."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Consume Reset Authorization
    |--------------------------------------------------------------------------
    |
    | Delete the matching reset record before changing the password.
    | This makes the reset token single-use, including concurrent requests.
    |
    |--------------------------------------------------------------------------
    */

    const consumedRecord =
      await PasswordReset.findOneAndDelete({

        _id:
          resetRecord._id,

        resetTokenHash,

        resetTokenExpiresAt: {
          $gt: new Date()
        }

      });


    if (!consumedRecord) {

      return res.status(400).json({

        success: false,

        message:
          "Your password reset session is invalid or has already been used. Please start again."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Find Account
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findById(
        resetRecord.userId
      );


    if (!user || !user.isVerified) {

      return res.status(400).json({

        success: false,

        message:
          "This account can no longer be reset. Please contact support."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Hash New Password
    |--------------------------------------------------------------------------
    |
    | Use the same bcrypt cost as the existing registration flow.
    |
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    user.password =
      passwordHash;

    await user.save();


    /*
    |--------------------------------------------------------------------------
    | Password Reset Successful
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({

      success: true,

      message:
        "Your password has been reset successfully. You can now log in with your new password."

    });


  } catch (error) {

    console.error(

      "Reset password error:",

      error

    );

    return res.status(500).json({

      success: false,

      message:
        "Password reset failed. Please try again later."

    });

  }

};


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| Only verified accounts can log in.
|
| Expected request body:
|
| {
|   "emailOrPhone": "john@example.com",
|   "password": "password123"
| }
|
| OR:
|
| {
|   "emailOrPhone": "9876543210",
|   "password": "password123"
| }
|
|--------------------------------------------------------------------------
*/

const login = async (
  req,
  res
) => {

  try {

    const {
      emailOrPhone,
      password
    } =
      req.body;


    /*
    |--------------------------------------------------------------------------
    | Basic Validation
    |--------------------------------------------------------------------------
    */

    if (
      typeof emailOrPhone !== "string" ||
      typeof password !== "string"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Email or phone number and password are required."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Parse Email OR Phone
    |--------------------------------------------------------------------------
    */

    const parsed =
      parseEmailOrPhone(
        emailOrPhone
      );


    if (
      !parsed.type ||
      !parsed.value
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please enter a valid email address or Indian mobile number."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Password Length
    |--------------------------------------------------------------------------
    */

    if (
      password.length <
      PASSWORD_MIN_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid email/phone or password."

      });

    }


    if (
      password.length >
      PASSWORD_MAX_LENGTH
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid email/phone or password."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    |
    | Password and other protected fields are explicitly selected.
    |
    |--------------------------------------------------------------------------
    */

    const user =
      parsed.type === "email"

        ? await User.findOne({

            email:
              parsed.value

          }).select(
            "+password"
          )

        : await User.findOne({

            phone:
              parsed.value

          }).select(
            "+password"
          );


    /*
    |--------------------------------------------------------------------------
    | Generic Invalid Credentials Response
    |--------------------------------------------------------------------------
    |
    | Do not reveal whether an email/phone actually exists.
    |
    |--------------------------------------------------------------------------
    */

    if (!user) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid email/phone or password."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Check Verification
    |--------------------------------------------------------------------------
    */

    if (
      !user.isVerified
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Please verify your account with the OTP before logging in.",

        requiresVerification:
          true,

        userId:
          String(
            user._id
          ),

        verificationMethod:
          user.verificationMethod

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Check Blocked Status
    |--------------------------------------------------------------------------
    */

    if (
      user.isBlocked
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Your account has been blocked. Please contact support."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Compare Password
    |--------------------------------------------------------------------------
    */

    const passwordMatches =
      await bcrypt.compare(

        password,

        user.password

      );


    if (
      !passwordMatches
    ) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid email/phone or password."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Create JWT
    |--------------------------------------------------------------------------
    */

    const token =
      createToken(
        user._id
      );


    /*
    |--------------------------------------------------------------------------
    | Set Authentication Cookie
    |--------------------------------------------------------------------------
    */

    res.cookie(

      getCookieName(),

      token,

      getCookieOptions()

    );


    /*
    |--------------------------------------------------------------------------
    | Login Successful
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({

      success: true,

      message:
        "Login successful.",

      user:
        formatUser(user)

    });


  } catch (error) {


    /*
    |--------------------------------------------------------------------------
    | Unexpected Error
    |--------------------------------------------------------------------------
    */

    console.error(

      "Login error:",

      error

    );

    return res.status(500).json({

      success: false,

      message:
        "Login failed. Please try again later."

    });

  }

};


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

const logout = async (
  req,
  res
) => {

  try {


    /*
    |--------------------------------------------------------------------------
    | Clear Authentication Cookie
    |--------------------------------------------------------------------------
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


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({

      success: true,

      message:
        "Logged out successfully."

    });


  } catch (error) {

    console.error(

      "Logout error:",

      error

    );

    return res.status(500).json({

      success: false,

      message:
        "Logout failed. Please try again later."

    });

  }

};


/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
|
| The authMiddleware has already:
|
| - validated the JWT
| - found the user
| - checked that the user exists
| - checked that the user is not blocked
|
|--------------------------------------------------------------------------
*/

const getMe = async (
  req,
  res
) => {

  try {


    /*
    |--------------------------------------------------------------------------
    | Authentication Middleware Check
    |--------------------------------------------------------------------------
    */

    if (!req.user) {

      return res.status(401).json({

        success: false,

        message:
          "Not authenticated."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Check Verification
    |--------------------------------------------------------------------------
    */

    if (
      !req.user.isVerified
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Account verification is required."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Check Blocked Status
    |--------------------------------------------------------------------------
    */

    if (
      req.user.isBlocked
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Your account has been blocked."

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Return Safe User
    |--------------------------------------------------------------------------
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
        "Could not retrieve your account."

    });

  }

};


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {

  register,

  verifyRegistrationOTP,

  resendRegistrationOTP,

  requestPasswordReset,

  verifyPasswordResetOTP,

  resetPassword,

  login,

  logout,

  getMe

};