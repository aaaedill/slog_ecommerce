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
    | Email addresses are normalized to lowercase.
    |
    |--------------------------------------------------------------------------
    */

    email: {
      type: String,
      required: [
        true,
        "Email is required"
      ],
      unique: true,
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
| User Model
|--------------------------------------------------------------------------
*/

const User = mongoose.model(
  "User",
  userSchema
);


export default User;