import mongoose from "mongoose";
import User from "../models/User.js";


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};


const normalizeUserId = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};


/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
|
| Admin only
|
| Passwords are intentionally never selected or returned.
|
|--------------------------------------------------------------------------
*/

export const getAllUsers = async (
  req,
  res
) => {
  try {
    const users = await User.find({})
      .select(
        "_id name email role isBlocked createdAt updatedAt"
      )
      .sort({
        createdAt: -1
      })
      .lean();

    const userList = users.map(
      (user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
    );

    return res.status(200).json({
      success: true,
      users: userList
    });

  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load users"
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
|
| Admin only
|
| Currently used for:
|
| - Block user
| - Unblock user
|
|--------------------------------------------------------------------------
*/

export const updateUser = async (
  req,
  res
) => {
  try {
    const id =
      normalizeUserId(
        req.params.id
      );

    const {
      isBlocked
    } = req.body || {};


    /*
     * Validate user ID
     */

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }


    /*
     * Validate block status
     *
     * Only an actual boolean is accepted.
     *
     * Examples:
     *
     * true  → valid
     * false → valid
     * "true" → invalid
     * 1 → invalid
     * 0 → invalid
     */

    if (
      typeof isBlocked !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isBlocked must be a boolean"
      });
    }


    /*
     * Find user
     *
     * Never select the password field.
     */

    const user =
      await User.findById(id).select(
        "_id name email role isBlocked"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


    /*
     * Prevent blocking admin accounts.
     *
     * This protects administrator accounts from
     * being disabled through the normal user-management
     * endpoint.
     */

    if (
      user.role === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot be blocked here"
      });
    }


    /*
     * Avoid unnecessary database writes.
     */

    if (
      user.isBlocked === isBlocked
    ) {
      return res.status(200).json({
        success: true,
        message: isBlocked
          ? "User is already blocked"
          : "User is already unblocked",
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked
        }
      });
    }


    /*
     * Update block status.
     */

    user.isBlocked =
      isBlocked;

    await user.save();


    /*
     * Return updated user.
     *
     * Password is never included.
     */

    return res.status(200).json({
      success: true,
      message: isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });

  } catch (error) {
    console.error(
      "Update user error:",
      error
    );


    /*
     * Handle invalid ObjectId / CastError.
     */

    if (
      error?.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }


    /*
     * Handle Mongoose validation errors.
     */

    if (
      error?.name ===
      "ValidationError"
    ) {
      const validationErrors =
        Object.values(
          error.errors || {}
        ).map(
          (validationError) =>
            validationError.message
        );

      return res.status(400).json({
        success: false,
        message:
          "User validation failed",
        errors:
          validationErrors
      });
    }


    /*
     * Unexpected server error.
     */

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user"
    });
  }
};