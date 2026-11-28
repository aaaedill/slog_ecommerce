
import mongoose from "mongoose";


/*
|--------------------------------------------------------------------------
| PASSWORD RESET MODEL
|--------------------------------------------------------------------------
|
| This model manages the password reset process separately from
| the registration OTP fields stored in the User model.
|
| Password reset flow:
|
| 1. Customer requests password reset.
| 2. Six-digit OTP is generated and emailed.
| 3. OTP hash and expiry are stored here.
| 4. Customer verifies the OTP.
| 5. A temporary reset authorization token is generated.
| 6. Customer resets their password.
| 7. The reset record is deleted after successful completion.
|
|--------------------------------------------------------------------------
*/


const passwordResetSchema = new mongoose.Schema(

  {


    /*
    |--------------------------------------------------------------------------
    | User ID
    |--------------------------------------------------------------------------
    |
    | Associates the password reset request with an existing account.
    |
    */

    userId: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true

    },


    /*
    |--------------------------------------------------------------------------
    | Email Address
    |--------------------------------------------------------------------------
    |
    | Stored in lowercase to ensure consistent email lookup.
    |
    */

    email: {

      type: String,

      required: true,

      lowercase: true,

      trim: true,

      maxlength: 254,

      unique: true

    },


    /*
    |--------------------------------------------------------------------------
    | OTP Hash
    |--------------------------------------------------------------------------
    |
    | Never store the actual six-digit OTP.
    | Only its bcrypt hash is stored.
    |
    */

    otpHash: {

      type: String,

      required: true,

      select: false

    },


    /*
    |--------------------------------------------------------------------------
    | OTP Expiry
    |--------------------------------------------------------------------------
    */

    otpExpiresAt: {

      type: Date,

      required: true

    },


    /*
    |--------------------------------------------------------------------------
    | OTP Attempts
    |--------------------------------------------------------------------------
    |
    | Tracks incorrect OTP verification attempts.
    |
    */

    otpAttempts: {

      type: Number,

      default: 0,

      min: 0

    },


    /*
    |--------------------------------------------------------------------------
    | Last OTP Sent At
    |--------------------------------------------------------------------------
    |
    | Used to enforce the resend cooldown.
    |
    */

    lastSentAt: {

      type: Date,

      required: true

    },


    /*
    |--------------------------------------------------------------------------
    | Reset Token Hash
    |--------------------------------------------------------------------------
    |
    | Created only after successful OTP verification.
    |
    | The original reset token is never stored in MongoDB.
    |
    */

    resetTokenHash: {

      type: String,

      default: undefined,

      select: false

    },


    /*
    |--------------------------------------------------------------------------
    | Reset Token Expiry
    |--------------------------------------------------------------------------
    */

    resetTokenExpiresAt: {

      type: Date,

      default: undefined

    },


    /*
    |--------------------------------------------------------------------------
    | OTP Verification Timestamp
    |--------------------------------------------------------------------------
    */

    verifiedAt: {

      type: Date,

      default: undefined

    },


    /*
    |--------------------------------------------------------------------------
    | Automatic Document Cleanup
    |--------------------------------------------------------------------------
    |
    | MongoDB automatically deletes expired password reset records.
    |
    | Important:
    | cleanupAt is updated when OTP verification succeeds so the
    | document remains available until the reset token expires.
    |
    */

    cleanupAt: {

      type: Date,

      required: true,

      expires: 0

    }

  },


  /*
  |--------------------------------------------------------------------------
  | Schema Options
  |--------------------------------------------------------------------------
  */

  {

    timestamps: true

  }

);


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
|
| email:
| One active password reset record per email address.
|
| cleanupAt:
| Automatically removes expired reset records.
|
|--------------------------------------------------------------------------
|
| The email field already declares unique: true, so Mongoose
| automatically creates its unique index.
|
| The userId field already declares index: true.
|
| The cleanupAt field already declares expires: 0.
|
| No additional index declarations are required here.
|
|--------------------------------------------------------------------------
*/


const PasswordReset =

  mongoose.models.PasswordReset ||

  mongoose.model(

    "PasswordReset",

    passwordResetSchema

  );


export default PasswordReset;
