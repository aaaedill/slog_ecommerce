/*
|--------------------------------------------------------------------------
| OTP SERVICE
|--------------------------------------------------------------------------
|
| This service is responsible for:
|
| 1. Generating secure OTPs
| 2. Hashing OTPs before storing them
| 3. Sending OTPs through email using Brevo
| 4. Sending OTPs through SMS using MSG91
|
| IMPORTANT:
| - OTPs are NEVER stored as plain text.
| - OTPs are NEVER returned to the frontend.
| - OTPs are NEVER logged.
| - Provider credentials are read only from environment variables.
|
|--------------------------------------------------------------------------
*/

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { BrevoClient } from "@getbrevo/brevo";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const OTP_LENGTH = 6;

const OTP_EXPIRY_MINUTES = 10;

const OTP_MAX_ATTEMPTS = 5;

const OTP_HASH_ROUNDS = 12;


/*
|--------------------------------------------------------------------------
| Helper: Generate OTP
|--------------------------------------------------------------------------
|
| Generates a cryptographically secure six-digit OTP.
|
| Example:
|
| 483921
|
| We intentionally use crypto.randomInt instead of Math.random()
| because OTPs are security-sensitive values.
|
|--------------------------------------------------------------------------
*/

const generateOTP = () => {
  const minimum = 100000;
  const maximum = 1000000;

  return String(
    crypto.randomInt(
      minimum,
      maximum
    )
  );
};


/*
|--------------------------------------------------------------------------
| Helper: Hash OTP
|--------------------------------------------------------------------------
|
| OTPs are treated like passwords.
|
| We never store the actual OTP in MongoDB.
|
|--------------------------------------------------------------------------
*/

const hashOTP = async (otp) => {
  return bcrypt.hash(
    otp,
    OTP_HASH_ROUNDS
  );
};


/*
|--------------------------------------------------------------------------
| Helper: Verify OTP
|--------------------------------------------------------------------------
|
| Compares a user-entered OTP against the stored hash.
|
|--------------------------------------------------------------------------
*/

const verifyOTPHash = async (
  otp,
  otpHash
) => {
  if (!otp || !otpHash) {
    return false;
  }

  return bcrypt.compare(
    otp,
    otpHash
  );
};


/*
|--------------------------------------------------------------------------
| Helper: Create OTP Expiry
|--------------------------------------------------------------------------
*/

const getOTPExpiry = () => {
  const expiry = new Date();

  expiry.setMinutes(
    expiry.getMinutes() +
    OTP_EXPIRY_MINUTES
  );

  return expiry;
};


/*
|--------------------------------------------------------------------------
| Brevo Email Client
|--------------------------------------------------------------------------
|
| The Brevo API key is read from:
|
| BREVO_API_KEY
|
| No API key should ever be placed directly in this file.
|
| The current @getbrevo/brevo SDK uses BrevoClient.
|
|--------------------------------------------------------------------------
*/

const createBrevoClient = () => {
  const apiKey =
    process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is not configured."
    );
  }

  return new BrevoClient({
    apiKey
  });
};


/*
|--------------------------------------------------------------------------
| Send OTP Email
|--------------------------------------------------------------------------
|
| Sends the account verification OTP through Brevo.
|
|--------------------------------------------------------------------------
*/

const sendEmailOTP = async ({
  email,
  name,
  otp
}) => {
  if (!email) {
    throw new Error(
      "Email address is required to send an email OTP."
    );
  }

  if (
    !otp ||
    !/^\d{6}$/.test(
      String(otp)
    )
  ) {
    throw new Error(
      "A valid six-digit OTP is required."
    );
  }

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL;

  const senderName =
    process.env.BREVO_SENDER_NAME ||
    "SLOG Fashion";

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured."
    );
  }

  const brevoClient =
    createBrevoClient();


  /*
  |--------------------------------------------------------------------------
  | Transactional Email
  |--------------------------------------------------------------------------
  |
  | Brevo's current Node SDK uses:
  |
  | brevoClient.transactionalEmails.sendTransacEmail(...)
  |
  |--------------------------------------------------------------------------
  */

  await brevoClient.transactionalEmails.sendTransacEmail(
    {
      subject:
        "Verify your SLOG Fashion account",

      sender: {
        name: senderName,
        email: senderEmail
      },

      to: [
        {
          email,
          name:
            name ||
            "Customer"
        }
      ],

      htmlContent: `
        <!DOCTYPE html>

        <html>
          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <title>
              Verify your SLOG Fashion account
            </title>
          </head>


          <body
            style="
              margin: 0;
              padding: 0;
              background: #f5f5f5;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            "
          >

            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                padding: 40px 30px;
                border-radius: 10px;
                box-sizing: border-box;
              "
            >

              <h2
                style="
                  margin-top: 0;
                  color: #111111;
                "
              >
                Verify your account
              </h2>


              <p
                style="
                  color: #444444;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Hello
                ${name || "Customer"},
              </p>


              <p
                style="
                  color: #444444;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Thank you for creating
                your SLOG Fashion account.
                Please use the OTP below
                to verify your account.
              </p>


              <div
                style="
                  margin: 30px 0;
                  padding: 20px;
                  background: #f3f4f6;
                  border-radius: 8px;
                  text-align: center;
                "
              >

                <div
                  style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #111111;
                  "
                >
                  ${otp}
                </div>

              </div>


              <p
                style="
                  color: #666666;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This OTP will expire in
                ${OTP_EXPIRY_MINUTES}
                minutes.
              </p>


              <p
                style="
                  color: #666666;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                If you did not request
                this verification,
                you can safely ignore
                this email.
              </p>


              <p
                style="
                  margin-top: 30px;
                  color: #888888;
                  font-size: 12px;
                "
              >
                This is an automated message.
                Please do not reply.
              </p>

            </div>

          </body>
        </html>
      `
    }
  );

  return true;
};


/*
|--------------------------------------------------------------------------
| MSG91 Configuration
|--------------------------------------------------------------------------
|
| MSG91 is used for Indian SMS OTP delivery.
|
| IMPORTANT:
|
| The Indian MSG91 SMS setup is currently pending because
| the business DLT registration, Sender ID, and approved
| template configuration have not yet been completed.
|
| Required environment variables when SMS OTP is enabled:
|
| MSG91_AUTH_KEY
| MSG91_TEMPLATE_ID
|
|--------------------------------------------------------------------------
*/

const sendSMSOTP = async ({
  phone,
  otp
}) => {
  if (!phone) {
    throw new Error(
      "Phone number is required to send an SMS OTP."
    );
  }

  if (
    !otp ||
    !/^\d{6}$/.test(
      String(otp)
    )
  ) {
    throw new Error(
      "A valid six-digit OTP is required."
    );
  }

  const authKey =
    process.env.MSG91_AUTH_KEY;

  const templateId =
    process.env.MSG91_TEMPLATE_ID;

  if (!authKey) {
    throw new Error(
      "MSG91_AUTH_KEY is not configured."
    );
  }

  if (!templateId) {
    throw new Error(
      "MSG91_TEMPLATE_ID is not configured."
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Normalize Indian phone number
  |--------------------------------------------------------------------------
  |
  | Internally we store phone numbers as ten digits.
  |
  | MSG91 receives the number with country code:
  |
  | 91XXXXXXXXXX
  |
  |--------------------------------------------------------------------------
  */

  let cleanPhone =
    String(phone)
      .replace(/\D/g, "");


  /*
  |--------------------------------------------------------------------------
  | Remove +91 / 91 Prefix
  |--------------------------------------------------------------------------
  */

  if (
    cleanPhone.startsWith("91") &&
    cleanPhone.length === 12
  ) {
    cleanPhone =
      cleanPhone.slice(2);
  }


  /*
  |--------------------------------------------------------------------------
  | Validate Indian Mobile Number
  |--------------------------------------------------------------------------
  */

  if (
    cleanPhone.length !== 10 ||
    !/^[6-9]\d{9}$/.test(
      cleanPhone
    )
  ) {
    throw new Error(
      "Invalid Indian mobile number."
    );
  }


  /*
  |--------------------------------------------------------------------------
  | MSG91 OTP API
  |--------------------------------------------------------------------------
  |
  | MSG91's current SendOTP V5 API endpoint is:
  |
  | https://control.msg91.com/api/v5/otp
  |
  | The exact DLT/Sender configuration must be completed
  | in the MSG91 dashboard before Indian SMS delivery is
  | enabled.
  |
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      "https://control.msg91.com/api/v5/otp",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          authkey:
            authKey
        },

        body: JSON.stringify(
          {
            template_id:
              templateId,

            mobile:
              `91${cleanPhone}`,

            otp:
              String(otp)
          }
        )
      }
    );


  /*
  |--------------------------------------------------------------------------
  | Provider Response
  |--------------------------------------------------------------------------
  */

  let responseData =
    null;

  try {
    responseData =
      await response.json();
  } catch {
    responseData =
      null;
  }


  /*
  |--------------------------------------------------------------------------
  | Provider Error
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {
    const providerMessage =
      responseData?.message ||
      responseData?.error ||
      responseData?.type ||
      "MSG91 OTP service failed.";

    throw new Error(
      `SMS OTP delivery failed: ${providerMessage}`
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Return Success
  |--------------------------------------------------------------------------
  */

  return responseData;
};


/*
|--------------------------------------------------------------------------
| Create OTP Data
|--------------------------------------------------------------------------
|
| This helper generates:
|
| - the plain OTP for delivery
| - the hashed OTP for MongoDB
| - the expiration timestamp
|
| The plain OTP should ONLY be used for sending.
|
|--------------------------------------------------------------------------
*/

const createOTPData =
  async () => {
    const otp =
      generateOTP();

    const otpHash =
      await hashOTP(
        otp
      );

    const otpExpiresAt =
      getOTPExpiry();

    return {
      otp,
      otpHash,
      otpExpiresAt
    };
  };


/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
|
| Returns true if:
|
| - OTP exists
| - OTP has not expired
| - OTP has not exceeded the attempt limit
| - entered OTP matches the stored hash
|
|--------------------------------------------------------------------------
*/

const verifyOTP = async ({
  otp,
  otpHash,
  otpExpiresAt,
  otpAttempts = 0
}) => {
  if (!otpHash) {
    return {
      success: false,
      reason:
        "OTP_NOT_FOUND"
    };
  }


  /*
  |--------------------------------------------------------------------------
  | Check Attempts
  |--------------------------------------------------------------------------
  */

  if (
    otpAttempts >=
    OTP_MAX_ATTEMPTS
  ) {
    return {
      success: false,
      reason:
        "MAX_ATTEMPTS"
    };
  }


  /*
  |--------------------------------------------------------------------------
  | Check Expiry
  |--------------------------------------------------------------------------
  */

  if (
    !otpExpiresAt ||
    new Date() >
      new Date(
        otpExpiresAt
      )
  ) {
    return {
      success: false,
      reason:
        "OTP_EXPIRED"
    };
  }


  /*
  |--------------------------------------------------------------------------
  | Validate OTP Format
  |--------------------------------------------------------------------------
  */

  if (
    !otp ||
    !/^\d{6}$/.test(
      String(otp)
    )
  ) {
    return {
      success: false,
      reason:
        "INVALID_OTP"
    };
  }


  /*
  |--------------------------------------------------------------------------
  | Compare OTP
  |--------------------------------------------------------------------------
  */

  const isValid =
    await verifyOTPHash(
      String(otp),
      otpHash
    );


  if (!isValid) {
    return {
      success: false,
      reason:
        "INVALID_OTP"
    };
  }


  /*
  |--------------------------------------------------------------------------
  | Successful Verification
  |--------------------------------------------------------------------------
  */

  return {
    success: true
  };
};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,

  generateOTP,
  hashOTP,
  verifyOTPHash,
  getOTPExpiry,

  createOTPData,

  sendEmailOTP,
  sendSMSOTP,

  verifyOTP
};