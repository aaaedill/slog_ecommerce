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

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  createOTPData,
  sendEmailOTP,
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

  login,

  logout,

  getMe

};