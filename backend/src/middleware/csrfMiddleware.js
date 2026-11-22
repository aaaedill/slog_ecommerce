import crypto from "crypto";


/*
|--------------------------------------------------------------------------
| CSRF CONFIGURATION
|--------------------------------------------------------------------------
*/

const CSRF_COOKIE_NAME =
  "XSRF-TOKEN";

const CSRF_HEADER_NAME =
  "x-csrf-token";

const CSRF_TOKEN_BYTES =
  32;


/*
|--------------------------------------------------------------------------
| GENERATE CSRF TOKEN
|--------------------------------------------------------------------------
|
| Generates a cryptographically secure random token.
|
*/

const generateCSRFToken =
  () => {

    return crypto.randomBytes(
      CSRF_TOKEN_BYTES
    ).toString("hex");

  };


/*
|--------------------------------------------------------------------------
| COOKIE OPTIONS
|--------------------------------------------------------------------------
*/

const getCSRFTokenCookieOptions =
  () => {

    const isProduction =
      process.env.NODE_ENV ===
      "production";

    return {

      httpOnly:
        false,

      secure:
        isProduction,

      sameSite:
        isProduction
          ? "none"
          : "lax",

      path:
        "/",

      maxAge:
        7 * 24 * 60 * 60 * 1000

    };

  };


/*
|--------------------------------------------------------------------------
| SET CSRF TOKEN
|--------------------------------------------------------------------------
|
| Creates a CSRF token and stores it in a readable cookie.
|
*/

export const setCSRFToken =
  (req, res) => {

    const existingToken =
      req.cookies?.[CSRF_COOKIE_NAME];

    const token =
      existingToken ||
      generateCSRFToken();

    if (!existingToken) {

      res.cookie(
        CSRF_COOKIE_NAME,
        token,
        getCSRFTokenCookieOptions()
      );

    }

    return res.status(200).json({

      success:
        true,

      csrfToken:
        token

    });

  };


/*
|--------------------------------------------------------------------------
| CSRF PROTECTION
|--------------------------------------------------------------------------
|
| Protects state-changing requests that rely on
| cookie-based authentication.
|
| Safe methods do not modify server-side state and
| therefore do not require a CSRF token.
|
*/

export const csrfProtection =
  (req, res, next) => {

    const safeMethods = [
      "GET",
      "HEAD",
      "OPTIONS"
    ];

    if (
      safeMethods.includes(
        req.method
      )
    ) {

      return next();

    }


    /*
    |--------------------------------------------------------------------------
    | CSRF COOKIE
    |--------------------------------------------------------------------------
    */

    const cookieToken =
      req.cookies?.[CSRF_COOKIE_NAME];


    /*
    |--------------------------------------------------------------------------
    | CSRF HEADER
    |--------------------------------------------------------------------------
    */

    const headerToken =
      req.headers?.[CSRF_HEADER_NAME];


    /*
    |--------------------------------------------------------------------------
    | TOKEN PRESENCE
    |--------------------------------------------------------------------------
    */

    if (
      typeof cookieToken !==
        "string" ||
      typeof headerToken !==
        "string"
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "CSRF validation failed."

        });

    }


    /*
    |--------------------------------------------------------------------------
    | TOKEN FORMAT
    |--------------------------------------------------------------------------
    |
    | Our generated token contains exactly
    | 64 hexadecimal characters.
    |
    */

    if (
      !/^[a-f0-9]{64}$/i.test(
        cookieToken
      ) ||
      !/^[a-f0-9]{64}$/i.test(
        headerToken
      )
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "CSRF validation failed."

        });

    }


    /*
    |--------------------------------------------------------------------------
    | CONSTANT-TIME COMPARISON
    |--------------------------------------------------------------------------
    |
    | Prevents timing-based comparison attacks.
    |
    */

    const cookieBuffer =
      Buffer.from(
        cookieToken,
        "utf8"
      );

    const headerBuffer =
      Buffer.from(
        headerToken,
        "utf8"
      );


    if (
      cookieBuffer.length !==
      headerBuffer.length
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "CSRF validation failed."

        });

    }


    const tokensMatch =
      crypto.timingSafeEqual(
        cookieBuffer,
        headerBuffer
      );


    if (!tokensMatch) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "CSRF validation failed."

        });

    }


    /*
    |--------------------------------------------------------------------------
    | VALID TOKEN
    |--------------------------------------------------------------------------
    */

    return next();

  };


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCSRFToken
};