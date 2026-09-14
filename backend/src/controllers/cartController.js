import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";


// ============================================================
// CART VALIDATION CONSTANTS
// ============================================================

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

const MAX_PRODUCT_ID_LENGTH = 100;
const MAX_SIZE_LENGTH = 50;

const MAX_PRODUCT_STOCK = 1000000;


// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getAuthenticatedUserId = (
  req
) => {
  return req.user?._id;
};


const isValidUserId = (
  userId
) => {
  return mongoose.Types.ObjectId.isValid(
    userId
  );
};


const normalizeProductId = (
  productId
) => {
  if (
    productId === undefined ||
    productId === null
  ) {
    return "";
  }

  return String(
    productId
  ).trim();
};


const normalizeSize = (
  size
) => {
  if (
    size === undefined ||
    size === null
  ) {
    return "";
  }

  return String(
    size
  ).trim();
};


const normalizeSizeForComparison = (
  size
) => {
  return normalizeSize(
    size
  ).toLowerCase();
};


const validateProductId = (
  productId
) => {
  if (!productId) {
    return "Product ID is required.";
  }

  if (
    productId.length >
    MAX_PRODUCT_ID_LENGTH
  ) {
    return "Invalid product ID.";
  }

  return null;
};


const validateSize = (
  size
) => {
  if (!size) {
    return "Product size is required.";
  }

  if (
    size.length >
    MAX_SIZE_LENGTH
  ) {
    return "Invalid product size.";
  }

  return null;
};


const validateAddQuantity = (
  quantity
) => {
  const numericQuantity =
    Number(
      quantity
    );

  if (
    !Number.isInteger(
      numericQuantity
    ) ||
    numericQuantity <
      MIN_QUANTITY ||
    numericQuantity >
      MAX_QUANTITY
  ) {
    return {
      valid: false,

      message:
        `Quantity must be a whole number between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`
    };
  }

  return {
    valid: true,

    quantity:
      numericQuantity
  };
};


const validateUpdateQuantity = (
  quantity
) => {
  const numericQuantity =
    Number(
      quantity
    );

  if (
    !Number.isInteger(
      numericQuantity
    ) ||
    numericQuantity < 0 ||
    numericQuantity >
      MAX_QUANTITY
  ) {
    return {
      valid: false,

      message:
        `Quantity must be 0 or a whole number up to ${MAX_QUANTITY}.`
    };
  }

  return {
    valid: true,

    quantity:
      numericQuantity
  };
};


// ============================================================
// USER ACCESS CHECK
// ============================================================

const getUserAndCheckAccess =
  async (
    userId
  ) => {
    if (
      !isValidUserId(
        userId
      )
    ) {
      return {
        error: {
          status: 400,

          message:
            "Invalid user."
        }
      };
    }

    const user =
      await User.findById(
        userId
      ).select(
        "_id isBlocked"
      );

    if (!user) {
      return {
        error: {
          status: 404,

          message:
            "User not found."
        }
      };
    }

    if (
      user.isBlocked
    ) {
      return {
        error: {
          status: 403,

          message:
            "Your account has been blocked."
        }
      };
    }

    return {
      user
    };
  };


// ============================================================
// PRODUCT + SIZE + STOCK VALIDATION
// ============================================================

const getProductAndValidateSize =
  async (
    productId,
    requestedSize
  ) => {
    const product =
      await Product.findOne({
        id: productId
      });

    if (!product) {
      return {
        error: {
          status: 404,

          message:
            "Product not found."
        }
      };
    }

    if (
      !Array.isArray(
        product.sizes
      )
    ) {
      return {
        error: {
          status: 400,

          message:
            "Product size information is unavailable."
        }
      };
    }

    /*
     * Current product format:
     *
     * sizes: [
     *   {
     *     size: "S",
     *     stock: 5
     *   },
     *   {
     *     size: "M",
     *     stock: 0
     *   },
     *   {
     *     size: "L",
     *     stock: 12
     *   }
     * ]
     *
     * Size matching is case-insensitive.
     *
     * For example:
     *
     * "M"
     * "m"
     * " M "
     *
     * all refer to the same stored size.
     *
     * The actual database size name is returned as
     * canonicalSize and should be used when creating
     * the cart key.
     *
     * Legacy string sizes are recognized but are
     * NEVER considered purchasable because they do
     * not contain trustworthy stock information.
     */

    const normalizedRequestedSize =
      normalizeSizeForComparison(
        requestedSize
      );

    const sizeData =
      product.sizes.find(
        (
          sizeItem
        ) => {
          if (
            typeof sizeItem ===
            "string"
          ) {
            return (
              normalizeSizeForComparison(
                sizeItem
              ) ===
              normalizedRequestedSize
            );
          }

          if (
            !sizeItem ||
            typeof sizeItem !==
              "object"
          ) {
            return false;
          }

          return (
            normalizeSizeForComparison(
              sizeItem.size
            ) ===
            normalizedRequestedSize
          );
        }
      );

    if (!sizeData) {
      return {
        error: {
          status: 400,

          message:
            "Selected size is not available."
        }
      };
    }


    // --------------------------------------------------------
    // Legacy string-size safety check
    // --------------------------------------------------------

    if (
      typeof sizeData ===
      "string"
    ) {
      return {
        error: {
          status: 400,

          message:
            "Selected size is currently unavailable."
        }
      };
    }


    const canonicalSize =
      normalizeSize(
        sizeData.size
      );

    if (!canonicalSize) {
      return {
        error: {
          status: 409,

          message:
            "Size information for the selected product is invalid."
        }
      };
    }

    if (
      canonicalSize.length >
      MAX_SIZE_LENGTH
    ) {
      return {
        error: {
          status: 409,

          message:
            "Size information for the selected product is invalid."
        }
      };
    }


    const stock =
      Number(
        sizeData.stock
      );

    if (
      !Number.isInteger(
        stock
      ) ||
      stock < 0 ||
      stock >
        MAX_PRODUCT_STOCK
    ) {
      return {
        error: {
          status: 409,

          message:
            "Stock information for the selected size is invalid."
        }
      };
    }


    if (
      stock === 0
    ) {
      return {
        error: {
          status: 400,

          message:
            "Selected size is sold out."
        }
      };
    }


    return {
      product,

      sizeData,

      canonicalSize,

      stock
    };
  };


// ============================================================
// CART KEY
// ============================================================

const createCartKey = (
  productId,
  size
) => {
  return `${productId}_${size}`;
};


// ============================================================
// GET CART
// ============================================================

const getCart = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(
        req
      );


    const accessCheck =
      await getUserAndCheckAccess(
        userId
      );

    if (
      accessCheck.error
    ) {
      return res.status(
        accessCheck.error.status
      ).json({
        success: false,

        message:
          accessCheck.error.message
      });
    }


    const cart =
      await Cart.findOne({
        userId
      });


    if (!cart) {
      return res.status(
        200
      ).json({
        success: true,

        cart: null
      });
    }


    return res.status(
      200
    ).json({
      success: true,

      cart
    });
  } catch (error) {
    console.error(
      "Get cart error:",
      error
    );


    return res.status(
      500
    ).json({
      success: false,

      message:
        "Failed to load cart."
    });
  }
};


// ============================================================
// ADD TO CART
// ============================================================

const addToCart = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(
        req
      );


    const {
      productId,
      size,
      quantity = 1
    } = req.body || {};


    // --------------------------------------------------------
    // Validate user
    // --------------------------------------------------------

    const accessCheck =
      await getUserAndCheckAccess(
        userId
      );

    if (
      accessCheck.error
    ) {
      return res.status(
        accessCheck.error.status
      ).json({
        success: false,

        message:
          accessCheck.error.message
      });
    }


    // --------------------------------------------------------
    // Validate product ID
    // --------------------------------------------------------

    const normalizedProductId =
      normalizeProductId(
        productId
      );


    const productIdError =
      validateProductId(
        normalizedProductId
      );

    if (
      productIdError
    ) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          productIdError
      });
    }


    // --------------------------------------------------------
    // Validate size
    // --------------------------------------------------------

    const requestedSize =
      normalizeSize(
        size
      );


    const sizeError =
      validateSize(
        requestedSize
      );

    if (
      sizeError
    ) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          sizeError
      });
    }


    // --------------------------------------------------------
    // Validate quantity
    // --------------------------------------------------------

    const quantityValidation =
      validateAddQuantity(
        quantity
      );

    if (
      !quantityValidation.valid
    ) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          quantityValidation.message
      });
    }


    const numericQuantity =
      quantityValidation.quantity;


    // --------------------------------------------------------
    // Verify product + exact size + stock
    // --------------------------------------------------------

    const productCheck =
      await getProductAndValidateSize(
        normalizedProductId,
        requestedSize
      );


    if (
      productCheck.error
    ) {
      return res.status(
        productCheck.error.status
      ).json({
        success: false,

        message:
          productCheck.error.message
      });
    }


    const {
      canonicalSize,
      stock
    } = productCheck;


    // --------------------------------------------------------
    // Find or create cart
    // --------------------------------------------------------

    let cart =
      await Cart.findOne({
        userId
      });


    if (!cart) {
      cart =
        new Cart({
          userId,

          items:
            new Map()
        });
    }


    /*
     * Safety fallback for old/corrupted cart documents
     * where items is not a Mongoose Map.
     */

    if (
      !cart.items ||
      typeof cart.items.get !==
        "function"
    ) {
      cart.items =
        new Map();
    }


    // --------------------------------------------------------
    // Create canonical cart key
    // --------------------------------------------------------

    const cartKey =
      createCartKey(
        normalizedProductId,
        canonicalSize
      );


    // --------------------------------------------------------
    // Read existing quantity
    // --------------------------------------------------------

    const currentQuantityRaw =
      cart.items.get(
        cartKey
      );


    let safeCurrentQuantity =
      0;


    if (
      currentQuantityRaw !==
      undefined
    ) {
      const currentQuantity =
        Number(
          currentQuantityRaw
        );


      if (
        Number.isInteger(
          currentQuantity
        ) &&
        currentQuantity >= 0
      ) {
        safeCurrentQuantity =
          currentQuantity;
      } else {
        /*
         * Corrupted cart quantity.
         *
         * Treat it as zero instead of allowing
         * invalid data to influence the new quantity.
         */

        safeCurrentQuantity =
          0;
      }
    }


    // --------------------------------------------------------
    // Calculate new quantity
    // --------------------------------------------------------

    const newQuantity =
      safeCurrentQuantity +
      numericQuantity;


    // --------------------------------------------------------
    // Maximum cart quantity
    // --------------------------------------------------------

    if (
      newQuantity >
      MAX_QUANTITY
    ) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          `Maximum quantity for one product and size is ${MAX_QUANTITY}.`
      });
    }


    // --------------------------------------------------------
    // Per-size stock check
    // --------------------------------------------------------

    if (
      newQuantity >
      stock
    ) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          stock === 1
            ? "Only 1 piece is available for this size."
            : `Only ${stock} pieces are available for this size.`
      });
    }


    // --------------------------------------------------------
    // Save cart quantity
    // --------------------------------------------------------

    cart.items.set(
      cartKey,
      newQuantity
    );


    await cart.save();


    return res.status(
      200
    ).json({
      success: true,

      message:
        "Product added to cart.",

      cart
    });
  } catch (error) {
    console.error(
      "Add to cart error:",
      error
    );


    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          "Invalid cart data."
      });
    }


    if (
      error?.code ===
      11000
    ) {
      /*
       * The cart has a unique userId index.
       *
       * This can happen when two requests try to
       * create the same user's cart at exactly
       * the same time.
       */

      return res.status(
        409
      ).json({
        success: false,

        message:
          "Your cart was updated by another request. Please try again."
      });
    }


    return res.status(
      500
    ).json({
      success: false,

      message:
        "Failed to add product to cart."
    });
  }
};


// ============================================================
// UPDATE CART ITEM
// ============================================================

const updateCartItem =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req
        );


      const {
        productId,
        size,
        quantity
      } = req.body || {};


      // ------------------------------------------------------
      // Validate user
      // ------------------------------------------------------

      const accessCheck =
        await getUserAndCheckAccess(
          userId
        );


      if (
        accessCheck.error
      ) {
        return res.status(
          accessCheck.error.status
        ).json({
          success: false,

          message:
            accessCheck.error.message
        });
      }


      // ------------------------------------------------------
      // Validate product ID
      // ------------------------------------------------------

      const normalizedProductId =
        normalizeProductId(
          productId
        );


      const productIdError =
        validateProductId(
          normalizedProductId
        );


      if (
        productIdError
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            productIdError
        });
      }


      // ------------------------------------------------------
      // Validate size
      // ------------------------------------------------------

      const requestedSize =
        normalizeSize(
          size
        );


      const sizeError =
        validateSize(
          requestedSize
        );


      if (
        sizeError
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            sizeError
        });
      }


      // ------------------------------------------------------
      // Validate quantity
      // ------------------------------------------------------

      if (
        quantity ===
          undefined ||
        quantity ===
          null
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Quantity is required."
        });
      }


      const quantityValidation =
        validateUpdateQuantity(
          quantity
        );


      if (
        !quantityValidation.valid
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            quantityValidation.message
        });
      }


      const numericQuantity =
        quantityValidation.quantity;


      // ------------------------------------------------------
      // Find user's cart
      // ------------------------------------------------------

      const cart =
        await Cart.findOne({
          userId
        });


      if (!cart) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Cart not found."
        });
      }


      if (
        !cart.items ||
        typeof cart.items.get !==
          "function"
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Cart data is invalid. Please refresh and try again."
        });
      }


      // ------------------------------------------------------
      // Find product and canonical size
      // ------------------------------------------------------

      const product =
        await Product.findOne({
          id:
            normalizedProductId
        });


      if (!product) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Product not found."
        });
      }


      if (
        !Array.isArray(
          product.sizes
        )
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Product size information is unavailable."
        });
      }


      const normalizedRequestedSize =
        normalizeSizeForComparison(
          requestedSize
        );


      const sizeData =
        product.sizes.find(
          (
            sizeItem
          ) => {
            if (
              typeof sizeItem ===
              "string"
            ) {
              return (
                normalizeSizeForComparison(
                  sizeItem
                ) ===
                normalizedRequestedSize
              );
            }


            if (
              !sizeItem ||
              typeof sizeItem !==
                "object"
            ) {
              return false;
            }


            return (
              normalizeSizeForComparison(
                sizeItem.size
              ) ===
              normalizedRequestedSize
            );
          }
        );


      if (!sizeData) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Selected size is not available."
        });
      }


      if (
        typeof sizeData ===
        "string"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Selected size is currently unavailable."
        });
      }


      const canonicalSize =
        normalizeSize(
          sizeData.size
        );


      if (!canonicalSize) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Size information for the selected product is invalid."
        });
      }


      const stock =
        Number(
          sizeData.stock
        );


      if (
        !Number.isInteger(
          stock
        ) ||
        stock < 0 ||
        stock >
          MAX_PRODUCT_STOCK
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Stock information for the selected size is invalid."
        });
      }


      // ------------------------------------------------------
      // Canonical cart key
      // ------------------------------------------------------

      const cartKey =
        createCartKey(
          normalizedProductId,
          canonicalSize
        );


      // ------------------------------------------------------
      // Make sure cart item exists
      // ------------------------------------------------------

      if (
        !cart.items.has(
          cartKey
        )
      ) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Cart item not found."
        });
      }


      // ------------------------------------------------------
      // Quantity 0 = remove item
      // ------------------------------------------------------

      if (
        numericQuantity ===
        0
      ) {
        cart.items.delete(
          cartKey
        );


        await cart.save();


        return res.status(
          200
        ).json({
          success: true,

          message:
            "Cart updated successfully.",

          cart
        });
      }


      // ------------------------------------------------------
      // Legacy size protection
      // ------------------------------------------------------

      if (
        !sizeData ||
        typeof sizeData !==
          "object"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Selected size is currently unavailable."
        });
      }


      // ------------------------------------------------------
      // Sold-out check
      // ------------------------------------------------------

      if (
        stock === 0
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Selected size is sold out."
        });
      }


      // ------------------------------------------------------
      // Per-size stock check
      // ------------------------------------------------------

      if (
        numericQuantity >
        stock
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            stock === 1
              ? "Only 1 piece is available for this size."
              : `Only ${stock} pieces are available for this size.`
        });
      }


      // ------------------------------------------------------
      // Update quantity
      // ------------------------------------------------------

      cart.items.set(
        cartKey,
        numericQuantity
      );


      await cart.save();


      return res.status(
        200
      ).json({
        success: true,

        message:
          "Cart updated successfully.",

        cart
      });
    } catch (error) {
      console.error(
        "Update cart item error:",
        error
      );


      if (
        error?.name ===
        "ValidationError"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid cart data."
        });
      }


      if (
        error?.code ===
        11000
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Your cart was updated by another request. Please try again."
        });
      }


      return res.status(
        500
      ).json({
        success: false,

        message:
          "Failed to update cart."
      });
    }
  };


// ============================================================
// REMOVE FROM CART
// ============================================================

const removeFromCart =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req
        );


      const {
        productId,
        size
      } = req.body || {};


      // ------------------------------------------------------
      // Validate user
      // ------------------------------------------------------

      const accessCheck =
        await getUserAndCheckAccess(
          userId
        );


      if (
        accessCheck.error
      ) {
        return res.status(
          accessCheck.error.status
        ).json({
          success: false,

          message:
            accessCheck.error.message
        });
      }


      // ------------------------------------------------------
      // Validate product ID
      // ------------------------------------------------------

      const normalizedProductId =
        normalizeProductId(
          productId
        );


      const productIdError =
        validateProductId(
          normalizedProductId
        );


      if (
        productIdError
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            productIdError
        });
      }


      // ------------------------------------------------------
      // Validate size
      // ------------------------------------------------------

      const requestedSize =
        normalizeSize(
          size
        );


      const sizeError =
        validateSize(
          requestedSize
        );


      if (
        sizeError
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            sizeError
        });
      }


      // ------------------------------------------------------
      // Find user's cart
      // ------------------------------------------------------

      const cart =
        await Cart.findOne({
          userId
        });


      if (!cart) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Cart not found."
        });
      }


      if (
        !cart.items ||
        typeof cart.items.delete !==
          "function"
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Cart data is invalid. Please refresh and try again."
        });
      }


      // ------------------------------------------------------
      // Find canonical product size
      // ------------------------------------------------------

      const product =
        await Product.findOne({
          id:
            normalizedProductId
        });


      if (!product) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Product not found."
        });
      }


      if (
        !Array.isArray(
          product.sizes
        )
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Product size information is unavailable."
        });
      }


      const normalizedRequestedSize =
        normalizeSizeForComparison(
          requestedSize
        );


      const sizeData =
        product.sizes.find(
          (
            sizeItem
          ) => {
            if (
              typeof sizeItem ===
              "string"
            ) {
              return (
                normalizeSizeForComparison(
                  sizeItem
                ) ===
                normalizedRequestedSize
              );
            }


            if (
              !sizeItem ||
              typeof sizeItem !==
                "object"
            ) {
              return false;
            }


            return (
              normalizeSizeForComparison(
                sizeItem.size
              ) ===
              normalizedRequestedSize
            );
          }
        );


      if (!sizeData) {
        /*
         * Even if the product size has been removed
         * from the product, we should still try to
         * remove a stale cart entry using the originally
         * requested key.
         */

        const fallbackCartKey =
          createCartKey(
            normalizedProductId,
            requestedSize
          );


        cart.items.delete(
          fallbackCartKey
        );


        await cart.save();


        return res.status(
          200
        ).json({
          success: true,

          message:
            "Product removed from cart.",

          cart
        });
      }


      let canonicalSize =
        requestedSize;


      if (
        typeof sizeData ===
        "object"
      ) {
        canonicalSize =
          normalizeSize(
            sizeData.size
          ) ||
          requestedSize;
      }


      // ------------------------------------------------------
      // Remove item
      // ------------------------------------------------------

      const cartKey =
        createCartKey(
          normalizedProductId,
          canonicalSize
        );


      cart.items.delete(
        cartKey
      );


      /*
       * Also remove the requested-size key if it differs
       * only by capitalization or whitespace.
       *
       * This cleans up stale carts created before the
       * canonical-size handling was introduced.
       */

      const requestedCartKey =
        createCartKey(
          normalizedProductId,
          requestedSize
        );


      if (
        requestedCartKey !==
        cartKey
      ) {
        cart.items.delete(
          requestedCartKey
        );
      }


      await cart.save();


      return res.status(
        200
      ).json({
        success: true,

        message:
          "Product removed from cart.",

        cart
      });
    } catch (error) {
      console.error(
        "Remove from cart error:",
        error
      );


      if (
        error?.name ===
        "ValidationError"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid cart data."
        });
      }


      return res.status(
        500
      ).json({
        success: false,

        message:
          "Failed to remove product from cart."
      });
    }
  };


// ============================================================
// CLEAR CART
// ============================================================

const clearCart =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        getAuthenticatedUserId(
          req
        );


      // ------------------------------------------------------
      // Validate user
      // ------------------------------------------------------

      const accessCheck =
        await getUserAndCheckAccess(
          userId
        );


      if (
        accessCheck.error
      ) {
        return res.status(
          accessCheck.error.status
        ).json({
          success: false,

          message:
            accessCheck.error.message
        });
      }


      // ------------------------------------------------------
      // Find user's cart
      // ------------------------------------------------------

      const cart =
        await Cart.findOne({
          userId
        });


      if (!cart) {
        return res.status(
          200
        ).json({
          success: true,

          message:
            "Cart is already empty.",

          cart: null
        });
      }


      // ------------------------------------------------------
      // Clear all items
      // ------------------------------------------------------

      cart.items =
        new Map();


      await cart.save();


      return res.status(
        200
      ).json({
        success: true,

        message:
          "Cart cleared successfully.",

        cart
      });
    } catch (error) {
      console.error(
        "Clear cart error:",
        error
      );


      if (
        error?.name ===
        "ValidationError"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid cart data."
        });
      }


      return res.status(
        500
      ).json({
        success: false,

        message:
          "Failed to clear cart."
      });
    }
  };


// ============================================================
// EXPORTS
// ============================================================

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};