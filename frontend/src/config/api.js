
import axios from "axios";


/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
|
| PRODUCTION:
| Requests use the same Vercel domain:
|
| https://slog-ecommerce.vercel.app/api
|
| Vercel forwards these requests to the Render backend
| using the rewrite configured in vercel.json.
|
| DEVELOPMENT:
| Requests continue using the local backend.
|
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.PROD
    ? "/api"
    : (
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api"
      );


/*
|--------------------------------------------------------------------------
| CSRF CONFIGURATION
|--------------------------------------------------------------------------
*/

const CSRF_ENDPOINT =
  `${API_URL}/auth/csrf`;

const CSRF_HEADER_NAME =
  "x-csrf-token";

const STATE_CHANGING_METHODS = [
  "post",
  "put",
  "patch",
  "delete"
];


/*
|--------------------------------------------------------------------------
| CSRF EXCLUDED AUTH ENDPOINTS
|--------------------------------------------------------------------------
*/

const CSRF_EXCLUDED_ENDPOINTS = [
  "/auth/register",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/login",
  "/auth/csrf"
];


/*
|--------------------------------------------------------------------------
| CSRF TOKEN STORAGE
|--------------------------------------------------------------------------
*/

let csrfToken = null;

let csrfRequestPromise = null;


/*
|--------------------------------------------------------------------------
| CHECK WHETHER REQUEST NEEDS CSRF
|--------------------------------------------------------------------------
*/

const shouldProtectRequest =
  (config) => {

    const method =
      String(
        config.method || "get"
      ).toLowerCase();

    if (
      !STATE_CHANGING_METHODS.includes(
        method
      )
    ) {

      return false;

    }

    if (
      config.__skipCSRF === true
    ) {

      return false;

    }

    const requestUrl =
      String(
        config.url || ""
      );

    return !CSRF_EXCLUDED_ENDPOINTS.some(
      (endpoint) =>
        requestUrl.endsWith(endpoint)
    );

  };


/*
|--------------------------------------------------------------------------
| GET CSRF TOKEN
|--------------------------------------------------------------------------
|
| Requests a CSRF token from the backend.
|
| The backend stores the token in the XSRF-TOKEN cookie and also
| returns the token in the response body.
|
|--------------------------------------------------------------------------
*/

const getCSRFToken =
  async () => {

    if (csrfToken) {

      return csrfToken;

    }

    if (csrfRequestPromise) {

      return csrfRequestPromise;

    }

    csrfRequestPromise =
      axios
        .get(
          CSRF_ENDPOINT,
          {
            withCredentials:
              true,

            __skipCSRF:
              true
          }
        )
        .then(
          (response) => {

            const token =
              response?.data?.csrfToken;

            if (
              typeof token !==
              "string" ||
              !token
            ) {

              throw new Error(
                "CSRF token was not returned by the server."
              );

            }

            csrfToken =
              token;

            return csrfToken;

          }
        )
        .finally(
          () => {

            csrfRequestPromise =
              null;

          }
        );

    return csrfRequestPromise;

  };


/*
|--------------------------------------------------------------------------
| CLEAR CSRF TOKEN
|--------------------------------------------------------------------------
*/

const clearCSRFToken =
  () => {

    csrfToken =
      null;

  };


/*
|--------------------------------------------------------------------------
| AXIOS DEFAULT CONFIGURATION
|--------------------------------------------------------------------------
|
| Authentication uses an HTTP-only cookie.
| Every request must allow cookies to be sent.
|
|--------------------------------------------------------------------------
*/

axios.defaults.withCredentials =
  true;


/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
|
| Automatically obtains a CSRF token before every protected
| state-changing request.
|
|--------------------------------------------------------------------------
*/

axios.interceptors.request.use(
  async (config) => {

    if (
      !shouldProtectRequest(
        config
      )
    ) {

      return config;

    }

    const token =
      await getCSRFToken();

    config.headers =
      config.headers ||
      {};

    config.headers[
      CSRF_HEADER_NAME
    ] =
      token;

    return config;

  },
  (error) =>
    Promise.reject(
      error
    )
);


/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
|
| If the backend rejects a request because the CSRF token is stale
| or invalid, obtain the current token and retry the request once.
|
|--------------------------------------------------------------------------
*/

axios.interceptors.response.use(
  (response) =>
    response,

  async (error) => {

    const originalRequest =
      error?.config;

    const status =
      error?.response?.status;

    const message =
      error?.response?.data?.message;

    const isCSRFError =
      status === 403 &&
      message ===
        "CSRF validation failed.";

    if (
      !isCSRFError ||
      !originalRequest ||
      originalRequest.__csrfRetry === true ||
      !shouldProtectRequest(
        originalRequest
      )
    ) {

      return Promise.reject(
        error
      );

    }

    originalRequest.__csrfRetry =
      true;

    clearCSRFToken();

    try {

      const token =
        await getCSRFToken();

      originalRequest.headers =
        originalRequest.headers ||
        {};

      originalRequest.headers[
        CSRF_HEADER_NAME
      ] =
        token;

      return axios(
        originalRequest
      );

    } catch (
      csrfError
    ) {

      return Promise.reject(
        csrfError
      );

    }

  }
);


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export {
  API_URL,
  getCSRFToken,
  clearCSRFToken
};

export default API_URL;