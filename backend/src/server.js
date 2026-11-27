
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";

import {
  setCSRFToken,
  csrfProtection
} from "./middleware/csrfMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import { fileURLToPath } from "url";



dotenv.config();



/*
|--------------------------------------------------------------------------
| APPLICATION
|--------------------------------------------------------------------------
*/

const app =
  express();



/*
|--------------------------------------------------------------------------
| TRUST PROXY
|--------------------------------------------------------------------------
|
| Render runs the backend behind a reverse proxy.
|
| Trusting the first proxy allows Express to correctly
| identify the original client IP address through the
| X-Forwarded-For header.
|
| This is required for express-rate-limit to work
| correctly when deployed on Render.
|
|--------------------------------------------------------------------------
*/

app.set(
  "trust proxy",
  1
);



/*
|--------------------------------------------------------------------------
| ENVIRONMENT CONFIGURATION
|--------------------------------------------------------------------------
*/

const rawPort =
  String(
    process.env.PORT || "5000"
  ).trim();



const PORT =
  Number.isInteger(
    Number(rawPort)
  ) &&
  Number(rawPort) > 0 &&
  Number(rawPort) <= 65535
    ? Number(rawPort)
    : 5000;



const CLIENT_URL =
  String(
    process.env.CLIENT_URL ||
      "http://localhost:5173"
  ).trim();



/*
|--------------------------------------------------------------------------
| RATE LIMITING
|--------------------------------------------------------------------------
|
| This provides a general protection layer for API endpoints.
|
| More specific rate limiting for login/register and other sensitive
| operations can be added later if necessary.
|
|--------------------------------------------------------------------------
*/

const apiLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    limit:
      200,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {

      success:
        false,

      message:
        "Too many requests. Please try again later."

    }

  });



/*
|--------------------------------------------------------------------------
| SECURITY HEADERS
|--------------------------------------------------------------------------
*/

app.use(
  helmet()
);



/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Only the configured frontend origin is allowed to make
| credentialed requests to this API.
|
| credentials: true is required because authentication uses
| an HTTP-only cookie.
|
|--------------------------------------------------------------------------
*/

app.use(
  cors({

    origin:
      CLIENT_URL,

    credentials:
      true

  })
);



/*
|--------------------------------------------------------------------------
| REQUEST BODY PARSING
|--------------------------------------------------------------------------
|
| The 10 MB limit is intentionally retained because the current
| admin product system can send product images as Base64 data.
|
| Later, when images are moved to Cloudinary/object storage,
| this limit can be reduced substantially.
|
|--------------------------------------------------------------------------
*/

app.use(
  express.json({

    limit:
      "10mb"

  })
);



app.use(
  express.urlencoded({

    extended:
      true,

    limit:
      "10mb"

  })
);



/*
|--------------------------------------------------------------------------
| COOKIE PARSER
|--------------------------------------------------------------------------
|
| Authentication uses an HTTP-only JWT cookie.
|
| CSRF protection also uses a separate readable CSRF token cookie.
|
|--------------------------------------------------------------------------
*/

app.use(
  cookieParser()
);



/*
|--------------------------------------------------------------------------
| API RATE LIMITER
|--------------------------------------------------------------------------
|
| Apply the general rate limiter to all API endpoints.
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api",
  apiLimiter
);



/*
|--------------------------------------------------------------------------
| ROOT ROUTE
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  (req, res) => {

    return res.status(200).json({

      success:
        true,

      message:
        "E-commerce API is running"

    });

  }
);



/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
|
| This endpoint reports:
|
| - Whether the API server is running
| - Whether MongoDB is configured
| - Whether MongoDB is currently connected
|
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (req, res) => {

    const databaseConfigured =
      Boolean(
        String(
          process.env.MONGO_URI ||
            ""
        ).trim()
      );



    const databaseConnected =
      databaseConfigured &&
      connectDB.isConnected === true;



    return res
      .status(
        databaseConnected
          ? 200
          : 503
      )
      .json({

        success:
          databaseConnected,

        message:
          databaseConnected
            ? "API and database are healthy"
            : "Database is not connected",

        server:
          "running",

        database:
          databaseConnected
            ? "connected"
            : databaseConfigured
              ? "configured but disconnected"
              : "not configured",

        environment:
          process.env.NODE_ENV ||
          "development"

      });

  }
);



/*
|--------------------------------------------------------------------------
| CSRF TOKEN
|--------------------------------------------------------------------------
|
| The frontend calls this endpoint before making
| cookie-authenticated state-changing requests.
|
| This endpoint creates the readable XSRF-TOKEN cookie
| and returns the same token in the response.
|
| The token itself is NOT the authentication token.
|
|--------------------------------------------------------------------------
*/

app.get(
  "/api/auth/csrf",
  setCSRFToken
);



/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);



/*
|--------------------------------------------------------------------------
| PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/products",
  productRoutes
);



/*
|--------------------------------------------------------------------------
| CART ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/cart",
  cartRoutes
);



/*
|--------------------------------------------------------------------------
| WISHLIST ROUTES
|--------------------------------------------------------------------------
|
| Wishlist operations are handled here.
|
| The wishlist routes require authentication and provide:
|
| 1. Retrieving the current user's wishlist
| 2. Adding a product to the wishlist
| 3. Removing a product from the wishlist
| 4. Clearing the wishlist
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/wishlist",
  wishlistRoutes
);



/*
|--------------------------------------------------------------------------
| ORDER ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/orders",
  orderRoutes
);



/*
|--------------------------------------------------------------------------
| ADMIN USER ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/users",
  adminUserRoutes
);



/*
|--------------------------------------------------------------------------
| ADMIN ORDER ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/orders",
  adminOrderRoutes
);



/*
|--------------------------------------------------------------------------
| UPLOAD ROUTES
|--------------------------------------------------------------------------
|
| Product image uploads are handled here.
|
| The upload route itself performs:
|
| 1. Authentication check
| 2. Admin authorization check
| 3. Image file validation through Multer
| 4. Cloudinary upload
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/uploads",
  uploadRoutes
);



/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
|
| Any API or application route that reaches this point does not exist.
|
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {

    return res.status(404).json({

      success:
        false,

      message:
        "API route not found"

    });

  }
);



/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
|
| This catches errors that reach Express without being handled
| by a controller or middleware.
|
| In production, internal error details are hidden from clients.
|
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Unhandled server error:",
      error
    );



    const statusCode =
      Number.isInteger(
        error?.status
      ) &&
      error.status >= 400 &&
      error.status < 600
        ? error.status
        : 500;



    return res
      .status(statusCode)
      .json({

        success:
          false,

        message:
          process.env.NODE_ENV ===
          "production"
            ? "Internal server error"
            : error?.message ||
              "Internal server error"

      });

  }
);



/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const startServer =
  async () => {

    try {

      console.log("");

      console.log(
        "=========================================="
      );

      console.log(
        "       STARTING E-COMMERCE BACKEND"
      );

      console.log(
        "=========================================="
      );

      console.log("");



      /*
      * Connect to MongoDB before starting
      * the HTTP server.
      */

      const databaseConnected =
        await connectDB();



      if (
        !databaseConnected
      ) {

        console.error("");

        console.error(
          "=========================================="
        );

        console.error(
          "       SERVER STARTUP ABORTED"
        );

        console.error(
          "=========================================="
        );

        console.error(
          "MongoDB connection failed."
        );

        console.error(
          "The backend will NOT start until MongoDB is connected."
        );

        console.error(
          "=========================================="
        );

        console.error("");

        process.exit(1);

      }



      /*
      * Start HTTP server only after
      * successful database connection.
      */

      const server =
        app.listen(
          PORT,
          () => {

            console.log("");

            console.log(
              "=========================================="
            );

            console.log(
              "       E-COMMERCE BACKEND STARTED"
            );

            console.log(
              "=========================================="
            );

            console.log(
              `Server: http://localhost:${PORT}`
            );

            console.log(
              `Health: http://localhost:${PORT}/api/health`
            );

            console.log(
              `CSRF: http://localhost:${PORT}/api/auth/csrf`
            );

            console.log(
              `Register: http://localhost:${PORT}/api/auth/register`
            );

            console.log(
              `Login: http://localhost:${PORT}/api/auth/login`
            );

            console.log(
              `Products: http://localhost:${PORT}/api/products`
            );

            console.log(
              `Cart: http://localhost:${PORT}/api/cart`
            );

            console.log(
              `Wishlist: http://localhost:${PORT}/api/wishlist`
            );

            console.log(
              `Orders: http://localhost:${PORT}/api/orders`
            );

            console.log(
              `Admin Users: http://localhost:${PORT}/api/admin/users`
            );

            console.log(
              `Admin Orders: http://localhost:${PORT}/api/admin/orders`
            );

            console.log(
              `Product Image Upload: http://localhost:${PORT}/api/uploads/product-image`
            );

            console.log(
              `Client: ${CLIENT_URL}`
            );

            console.log(
              "=========================================="
            );

            console.log("");

          }
        );



      /*
      * Graceful shutdown.
      *
      * When the process receives a shutdown signal,
      * stop accepting new HTTP connections and then
      * close the MongoDB connection.
      */

      const gracefulShutdown =
        async (
          signal
        ) => {

          console.log("");

          console.log(
            `Received ${signal}. Starting graceful shutdown...`
          );



          server.close(
            async () => {

              try {

                await connectDB.disconnect();



                console.log(
                  "MongoDB connection closed."
                );

                console.log(
                  "HTTP server closed."
                );

                console.log(
                  "Graceful shutdown completed."
                );



                process.exit(0);

              } catch (error) {

                console.error(
                  "Error during graceful shutdown:",
                  error
                );

                process.exit(1);

              }

            }
          );

        };



      /*
      * Handle normal termination signals.
      */

      process.once(
        "SIGINT",
        () => {

          gracefulShutdown(
            "SIGINT"
          );

        }
      );



      process.once(
        "SIGTERM",
        () => {

          gracefulShutdown(
            "SIGTERM"
          );

        }
      );



    } catch (error) {

      console.error("");

      console.error(
        "=========================================="
      );

      console.error(
        "       SERVER STARTUP FAILED"
      );

      console.error(
        "=========================================="
      );

      console.error(
        error
      );

      console.error(
        "=========================================="
      );

      console.error("");

      process.exit(1);

    }

  };



/*
|--------------------------------------------------------------------------
| RUN APPLICATION
|--------------------------------------------------------------------------
*/

startServer();