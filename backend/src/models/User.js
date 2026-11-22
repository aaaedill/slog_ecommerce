import mongoose from "mongoose";



/*
|--------------------------------------------------------------------------
| User Schema
|--------------------------------------------------------------------------
|
| This schema stores authentication and account information.
|
| IMPORTANT:
| The password field uses select: false so passwords are NOT returned
| by normal User.find(), User.findById(), etc. queries.
|
| Authentication code must explicitly request the password when needed
| for login using:
|
| .select("+password")
|
|--------------------------------------------------------------------------
*/


const userSchema = new mongoose.Schema(

  {

    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    name: {

      type: String,

      required: [
        true,
        "Name is required"
      ],

      trim: true,

      minlength: [
        2,
        "Name must be at least 2 characters"
      ],

      maxlength: [
        100,
        "Name cannot exceed 100 characters"
      ],

      validate: {

        validator: (value) => {

          return (
            typeof value === "string" &&
            value.trim().length >= 2
          );

        },

        message:
          "Name cannot be empty"

      }

    },



    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    |
    | Email is optional because the user can register using either:
    |
    | 1. Email address
    | 2. Indian mobile number
    |
    | When email is provided, it is normalized to lowercase.
    |
    | Uniqueness is handled by the explicit sparse index at the bottom
    | of this schema.
    |
    |--------------------------------------------------------------------------
    */

    email: {

      type: String,

      required: false,

      lowercase: true,

      trim: true,

      minlength: [
        5,
        "Email is too short"
      ],

      maxlength: [
        254,
        "Email cannot exceed 254 characters"
      ],

      validate: {

        validator: (value) => {

          if (!value) {
            return true;
          }

          const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          return (
            typeof value === "string" &&
            emailRegex.test(
              value.trim()
            )
          );

        },

        message:
          "Please provide a valid email address"

      }

    },



    /*
    |--------------------------------------------------------------------------
    | Phone Number
    |--------------------------------------------------------------------------
    |
    | Phone is optional because the user can register using either:
    |
    | 1. Email address
    | 2. Indian mobile number
    |
    | Only Indian mobile numbers are accepted.
    |
    | The database stores the normalized 10-digit Indian mobile number
    | without the +91 country code.
    |
    | Valid examples:
    |
    | 9876543210
    | 9123456789
    | 8765432109
    |
    | Invalid examples:
    |
    | 1234567890
    | 5123456789
    | 98765
    | +919876543210
    |
    | The controller will normalize +91 and 91 formats before saving.
    |
    | Uniqueness is handled by the explicit sparse index at the bottom
    | of this schema.
    |
    |--------------------------------------------------------------------------
    */

    phone: {

      type: String,

      required: false,

      trim: true,

      minlength: [
        10,
        "Indian mobile number must contain 10 digits"
      ],

      maxlength: [
        10,
        "Indian mobile number must contain 10 digits"
      ],

      validate: {

        validator: (value) => {

          if (!value) {
            return true;
          }

          const indianPhoneRegex =
            /^[6-9]\d{9}$/;

          return (
            typeof value === "string" &&
            indianPhoneRegex.test(
              value.trim()
            )
          );

        },

        message:
          "Please provide a valid Indian mobile number"

      }

    },



    /*
    |--------------------------------------------------------------------------
    | Password
    |--------------------------------------------------------------------------
    |
    | Passwords are stored as bcrypt hashes.
    |
    | The controller is responsible for hashing the password.
    |
    | select: false prevents accidental password exposure.
    |
    |--------------------------------------------------------------------------
    */

    password: {

      type: String,

      required: [
        true,
        "Password is required"
      ],

      select: false,

      minlength: [
        8,
        "Password must be at least 8 characters"
      ],

      maxlength: [
        200,
        "Password cannot exceed 200 characters"
      ],

      validate: {

        validator: (value) => {

          return (
            typeof value === "string" &&
            value.length >= 8
          );

        },

        message:
          "Password must be at least 8 characters"

      }

    },



    /*
    |--------------------------------------------------------------------------
    | Role
    |--------------------------------------------------------------------------
    |
    | Only these roles are permitted.
    |
    | Normal registration should create:
    |
    | role: "user"
    |
    | Admin accounts are created separately through the secured
    | createAdmin.js process.
    |
    |--------------------------------------------------------------------------
    */

    role: {

      type: String,

      enum: {

        values: [
          "user",
          "admin"
        ],

        message:
          "Invalid user role"

      },

      default: "user",

      required: true,

      trim: true

    },



    /*
    |--------------------------------------------------------------------------
    | Block Status
    |--------------------------------------------------------------------------
    |
    | Admin users can block/unblock normal users.
    |
    | Authentication middleware/controllers must also check this
    | value so a blocked user cannot continue using the account.
    |
    |--------------------------------------------------------------------------
    */

    isBlocked: {

      type: Boolean,

      default: false,

      required: true

    },



    /*
    |--------------------------------------------------------------------------
    | Account Verification
    |--------------------------------------------------------------------------
    |
    | A newly registered customer must verify either their email address
    | or their Indian mobile number through OTP before the account can
    | be used for login.
    |
    | Admin accounts created through createAdmin.js can be created as
    | already verified.
    |
    |--------------------------------------------------------------------------
    */

    isVerified: {

      type: Boolean,

      default: false,

      required: true

    },



    /*
    |--------------------------------------------------------------------------
    | Verification Method
    |--------------------------------------------------------------------------
    |
    | Stores which credential was used to verify the account.
    |
    | Possible values:
    |
    | "email"
    | "phone"
    |
    |--------------------------------------------------------------------------
    */

    verificationMethod: {

      type: String,

      enum: {

        values: [
          "email",
          "phone"
        ],

        message:
          "Invalid verification method"

      },

      default: null

    },



    /*
    |--------------------------------------------------------------------------
    | OTP Hash
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | The actual OTP must NEVER be stored in MongoDB.
    |
    | The controller will generate a random OTP and store only a secure
    | hash of that OTP here.
    |
    | select: false prevents the hash from being returned by normal
    | database queries.
    |
    |--------------------------------------------------------------------------
    */

    otpHash: {

      type: String,

      default: null,

      select: false,

      maxlength: [
        500,
        "OTP hash is too long"
      ]

    },



    /*
    |--------------------------------------------------------------------------
    | OTP Expiration
    |--------------------------------------------------------------------------
    |
    | Stores the exact time at which the current OTP becomes invalid.
    |
    | OTP verification must reject any OTP after this time.
    |
    |--------------------------------------------------------------------------
    */

    otpExpiresAt: {

      type: Date,

      default: null,

      select: false

    },



    /*
    |--------------------------------------------------------------------------
    | OTP Attempts
    |--------------------------------------------------------------------------
    |
    | Counts incorrect OTP verification attempts for the current OTP.
    |
    | The controller will enforce the maximum allowed attempts.
    |
    | This prevents unlimited guessing of the OTP.
    |
    |--------------------------------------------------------------------------
    */

    otpAttempts: {

      type: Number,

      default: 0,

      min: [
        0,
        "OTP attempts cannot be negative"
      ],

      max: [
        10,
        "OTP attempts cannot exceed 10"
      ],

      validate: {

        validator: Number.isInteger,

        message:
          "OTP attempts must be a whole number"

      },

      select: false

    },



    /*
    |--------------------------------------------------------------------------
    | OTP Last Sent Time
    |--------------------------------------------------------------------------
    |
    | Stores when the most recent OTP was sent.
    |
    | The controller will use this value to enforce a resend cooldown
    | and prevent OTP spam.
    |
    |--------------------------------------------------------------------------
    */

    otpLastSentAt: {

      type: Date,

      default: null,

      select: false

    }

  },



  {

    /*
    |--------------------------------------------------------------------------
    | Timestamps
    |--------------------------------------------------------------------------
    |
    | Automatically creates:
    |
    | createdAt
    | updatedAt
    |
    |--------------------------------------------------------------------------
    */

    timestamps: true,



    /*
    |--------------------------------------------------------------------------
    | Strict Mode
    |--------------------------------------------------------------------------
    |
    | Prevents unexpected fields from being silently stored.
    |
    |--------------------------------------------------------------------------
    */

    strict: true

  }

);



/*
|--------------------------------------------------------------------------
| Email Index
|--------------------------------------------------------------------------
|
| The sparse unique index allows users who register with phone numbers
| to have no email value while still preventing duplicate email accounts.
|
| This is intentionally defined here instead of using unique: true and
| sparse: true on the email field itself, preventing duplicate index
| definitions.
|
|--------------------------------------------------------------------------
*/

userSchema.index(

  { email: 1 },

  {

    unique: true,

    sparse: true

  }

);



/*
|--------------------------------------------------------------------------
| Phone Index
|--------------------------------------------------------------------------
|
| The sparse unique index allows users who register with email addresses
| to have no phone value while still preventing duplicate phone accounts.
|
| This is intentionally defined here instead of using unique: true and
| sparse: true on the phone field itself, preventing duplicate index
| definitions.
|
|--------------------------------------------------------------------------
*/

userSchema.index(

  { phone: 1 },

  {

    unique: true,

    sparse: true

  }

);



/*
|--------------------------------------------------------------------------
| User Model
|--------------------------------------------------------------------------
*/

const User = mongoose.model(

  "User",

  userSchema

);



export default User;