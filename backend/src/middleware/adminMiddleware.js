import User from "../models/User.js";


const adminMiddleware = async (
  req,
  res,
  next
) => {
  try {

    // ============================================================
    // AUTHENTICATION CHECK
    // ============================================================

    // authMiddleware must run before this middleware.
    //
    // authMiddleware verifies the JWT, checks that the user
    // exists, checks whether the account is blocked, and
    // attaches the authenticated user to req.user.

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Not authenticated. Please login first."
      });
    }


    // ============================================================
    // USER ID CHECK
    // ============================================================

    // Make sure the authenticated request contains a valid
    // MongoDB user ID before querying the database.

    if (!req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user information is missing."
      });
    }


    // ============================================================
    // FETCH CURRENT USER
    // ============================================================

    // Fetch the current user directly from MongoDB.
    //
    // This provides an additional authorization check instead
    // of relying only on information stored in the JWT.
    //
    // Only safe user fields are selected.
    // The password is never returned.

    const user = await User.findById(
      req.user._id
    ).select(
      "_id name email role isBlocked"
    );


    // ============================================================
    // USER EXISTENCE CHECK
    // ============================================================

    // The account may have been deleted after the JWT was issued.

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account no longer exists."
      });
    }


    // ============================================================
    // BLOCKED ACCOUNT CHECK
    // ============================================================

    // A blocked account must never be allowed to access
    // administrator functionality.

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked."
      });
    }


    // ============================================================
    // ADMIN ROLE CHECK
    // ============================================================

    // Only users whose current database role is exactly
    // "admin" are allowed to continue.

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required."
      });
    }


    // ============================================================
    // ATTACH VERIFIED USER
    // ============================================================

    // Replace req.user with the freshly verified database
    // record so downstream controllers receive the current
    // user information.

    req.user = user;


    // ============================================================
    // CONTINUE REQUEST
    // ============================================================

    return next();

  } catch (error) {

    // ============================================================
    // ERROR HANDLING
    // ============================================================

    console.error(
      "Admin middleware error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Admin authorization failed."
    });
  }
};


export default adminMiddleware;