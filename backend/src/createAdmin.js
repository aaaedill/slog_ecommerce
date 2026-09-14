import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();


const createAdmin = async () => {

  try {

    // =======================================================
    // CONNECT TO MONGODB
    // =======================================================

    const connected =
      await connectDB();


    if (!connected) {

      console.error(
        "MongoDB connection failed."
      );

      process.exit(1);
    }


    // =======================================================
    // ADMIN CONFIGURATION
    // =======================================================
    //
    // Admin credentials are now loaded from environment
    // variables instead of being stored inside this file.
    //
    // Required variables:
    //
    // ADMIN_NAME
    // ADMIN_EMAIL
    // ADMIN_PASSWORD
    //
    // These values belong in backend/.env.
    // They must NEVER be committed to GitHub.
    // =======================================================

    const adminName =
      String(
        process.env.ADMIN_NAME || ""
      ).trim();


    const adminEmail =
      String(
        process.env.ADMIN_EMAIL || ""
      )
        .trim()
        .toLowerCase();


    const adminPassword =
      String(
        process.env.ADMIN_PASSWORD || ""
      );


    // =======================================================
    // VALIDATE ENVIRONMENT VARIABLES
    // =======================================================

    if (!adminName) {

      console.error("");
      console.error(
        "ADMIN_NAME is missing from backend/.env."
      );
      console.error("");
      process.exit(1);
    }


    if (!adminEmail) {

      console.error("");
      console.error(
        "ADMIN_EMAIL is missing from backend/.env."
      );
      console.error("");
      process.exit(1);
    }


    if (!adminPassword) {

      console.error("");
      console.error(
        "ADMIN_PASSWORD is missing from backend/.env."
      );
      console.error("");
      process.exit(1);
    }


    // =======================================================
    // VALIDATE ADMIN EMAIL
    // =======================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(
        adminEmail
      )
    ) {

      console.error("");
      console.error(
        "ADMIN_EMAIL in backend/.env is not a valid email address."
      );
      console.error("");
      process.exit(1);
    }


    // =======================================================
    // VALIDATE ADMIN PASSWORD
    // =======================================================
    //
    // Keep this consistent with the password requirements
    // already used by the registration page.
    //
    // Minimum:
    // - 8 characters
    // - at least one lowercase letter
    // - at least one number
    //
    // The actual password is never printed to the console.
    // =======================================================

    const passwordRegex =
      /^(?=.*[a-z])(?=.*\d).{8,}$/;


    if (
      !passwordRegex.test(
        adminPassword
      )
    ) {

      console.error("");
      console.error(
        "ADMIN_PASSWORD must be at least 8 characters and contain at least one lowercase letter and one number."
      );
      console.error("");
      process.exit(1);
    }


    // =======================================================
    // FIND EXISTING ADMIN
    // =======================================================

    const existingUser =
      await User.findOne({
        email: adminEmail
      });


    // =======================================================
    // UPDATE EXISTING USER
    // =======================================================

    if (existingUser) {

      existingUser.name =
        adminName;


      existingUser.role =
        "admin";


      existingUser.isBlocked =
        false;


      existingUser.password =
        await bcrypt.hash(
          adminPassword,
          12
        );


      await existingUser.save();


      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "       ADMIN ACCOUNT UPDATED"
      );
      console.log(
        "=========================================="
      );
      console.log(
        `Email: ${adminEmail}`
      );
      console.log(
        "Role: admin"
      );
      console.log(
        "Password: updated from environment"
      );
      console.log(
        "=========================================="
      );
      console.log("");


      process.exit(0);
    }


    // =======================================================
    // CREATE NEW ADMIN
    // =======================================================

    const hashedPassword =
      await bcrypt.hash(
        adminPassword,
        12
      );


    const admin =
      await User.create({
        name:
          adminName,

        email:
          adminEmail,

        password:
          hashedPassword,

        role:
          "admin",

        isBlocked:
          false
      });


    // =======================================================
    // SUCCESS MESSAGE
    // =======================================================
    //
    // Never print the password.
    // =======================================================

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "       ADMIN ACCOUNT CREATED"
    );
    console.log(
      "=========================================="
    );
    console.log(
      `Email: ${admin.email}`
    );
    console.log(
      `Role: ${admin.role}`
    );
    console.log(
      "Password: configured from environment"
    );
    console.log(
      `MongoDB ID: ${admin._id}`
    );
    console.log(
      "=========================================="
    );
    console.log("");


    process.exit(0);

  } catch (error) {

    console.error("");
    console.error(
      "Failed to create admin account:"
    );
    console.error(
      error
    );
    console.error("");


    process.exit(1);
  }
};


createAdmin();