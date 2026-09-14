import mongoose from "mongoose";
import crypto from "node:crypto";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";


// ============================================================
// ORDER VALIDATION CONSTANTS
// ============================================================

const DELIVERY_FEE = 50;

const MAX_ORDER_ID_LENGTH = 50;
const MAX_PRODUCT_ID_LENGTH = 100;
const MAX_SIZE_LENGTH = 50;

const MAX_QUANTITY_PER_ITEM = 99;
const MAX_ORDER_ITEMS = 50;

const MAX_NAME_LENGTH = 200;
const MAX_ADDRESS_FIELD_LENGTH = 500;
const MAX_ADDRESS_FIELDS = 20;

const MAX_PAYMENT_METHOD_LENGTH = 50;

const MAX_STOCK = 1000000;


// ============================================================
// HELPER FUNCTIONS
// ============================================================

const isValidObjectId = (
  value
) => {
  return mongoose.Types.ObjectId.isValid(
    value
  );
};


const normalizeString = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(
    value
  ).trim();
};


const isPlainObject = (
  value
) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};


const normalizeSizeForComparison = (
  size
) => {
  return normalizeString(
    size
  ).toLowerCase();
};


const createApplicationError = (
  message,
  statusCode
) => {
  const error =
    new Error(
      message
    );

  error.statusCode =
    statusCode;

  return error;
};


// ============================================================
// ADDRESS VALIDATION
// ============================================================

const validateAddress = (
  address
) => {
  if (
    !isPlainObject(
      address
    )
  ) {
    return "Delivery address is required.";
  }

  const keys =
    Object.keys(
      address
    );

  if (
    keys.length === 0
  ) {
    return "Delivery address cannot be empty.";
  }

  if (
    keys.length >
    MAX_ADDRESS_FIELDS
  ) {
    return "Delivery address contains too many fields.";
  }

  let hasValidValue =
    false;

  for (
    const key of keys
  ) {
    if (
      typeof key !== "string" ||
      key.trim().length === 0 ||
      key.length > 100
    ) {
      return "Invalid delivery address.";
    }

    const value =
      address[key];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    if (
      typeof value === "string"
    ) {
      if (
        value.trim().length >
        MAX_ADDRESS_FIELD_LENGTH
      ) {
        return "One or more address fields are too long.";
      }

      if (
        value.trim().length > 0
      ) {
        hasValidValue =
          true;
      }

      continue;
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      hasValidValue =
        true;

      continue;
    }

    return "Invalid delivery address.";
  }

  if (
    !hasValidValue
  ) {
    return "Delivery address cannot be empty.";
  }

  return null;
};


// ============================================================
// PAYMENT VALIDATION
// ============================================================

const validatePaymentMethod = (
  paymentMethod
) => {
  const normalizedPaymentMethod =
    normalizeString(
      paymentMethod
    );

  if (
    !normalizedPaymentMethod
  ) {
    return {
      valid: false,
      message:
        "Payment method is required."
    };
  }

  if (
    normalizedPaymentMethod.length >
    MAX_PAYMENT_METHOD_LENGTH
  ) {
    return {
      valid: false,
      message:
        "Invalid payment method."
    };
  }

  /*
   * The current application supports
   * Cash on Delivery only.
   *
   * Accept several common representations
   * so existing frontend code remains
   * compatible.
   */

  const normalizedLower =
    normalizedPaymentMethod
      .toLowerCase();

  const codMethods =
    new Set([
      "cod",
      "cash on delivery",
      "cash_on_delivery",
      "cash-on-delivery"
    ]);

  if (
    !codMethods.has(
      normalizedLower
    )
  ) {
    return {
      valid: false,
      message:
        "The selected payment method is not available."
    };
  }

  return {
    valid: true,
    paymentMethod: "COD"
  };
};


// ============================================================
// QUANTITY VALIDATION
// ============================================================

const validateCartQuantity = (
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
    numericQuantity < 1 ||
    numericQuantity >
      MAX_QUANTITY_PER_ITEM
  ) {
    return {
      valid: false,
      message:
        `Invalid cart quantity. Quantity must be a whole number between 1 and ${MAX_QUANTITY_PER_ITEM}.`
    };
  }

  return {
    valid: true,
    quantity:
      numericQuantity
  };
};


// ============================================================
// CART KEY VALIDATION
// ============================================================

const validateCartKey = (
  cartKey
) => {
  if (
    typeof cartKey !== "string" ||
    cartKey.trim().length === 0
  ) {
    return {
      valid: false,
      message:
        "Invalid cart item."
    };
  }

  const separatorIndex =
    cartKey.lastIndexOf(
      "_"
    );

  if (
    separatorIndex <= 0 ||
    separatorIndex >=
      cartKey.length - 1
  ) {
    return {
      valid: false,
      message:
        "Invalid cart item."
    };
  }

  const productId =
    cartKey
      .substring(
        0,
        separatorIndex
      )
      .trim();

  const size =
    cartKey
      .substring(
        separatorIndex + 1
      )
      .trim();

  if (
    !productId ||
    !size
  ) {
    return {
      valid: false,
      message:
        "Invalid cart item."
    };
  }

  if (
    productId.length >
    MAX_PRODUCT_ID_LENGTH
  ) {
    return {
      valid: false,
      message:
        "Invalid product ID."
    };
  }

  if (
    size.length >
    MAX_SIZE_LENGTH
  ) {
    return {
      valid: false,
      message:
        "Invalid product size."
    };
  }

  return {
    valid: true,
    productId,
    size
  };
};


// ============================================================
// USER ACCESS CHECK
// ============================================================

const checkUserAccess = async (
  userId,
  session = null
) => {
  if (
    !isValidObjectId(
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

  let query =
    User.findById(
      userId
    ).select(
      "_id isBlocked"
    );

  if (
    session
  ) {
    query =
      query.session(
        session
      );
  }

  const user =
    await query;

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
// FIND EXACT PRODUCT SIZE
// ============================================================

const findProductSize = (
  product,
  requestedSize
) => {
  if (
    !product ||
    !Array.isArray(
      product.sizes
    )
  ) {
    return null;
  }

  const normalizedRequestedSize =
    normalizeSizeForComparison(
      requestedSize
    );

  if (
    !normalizedRequestedSize
  ) {
    return null;
  }

  return (
    product.sizes.find(
      (
        sizeItem
      ) => {
        if (
          !sizeItem ||
          typeof sizeItem !==
            "object" ||
          Array.isArray(
            sizeItem
          )
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
    ) || null
  );
};


// ============================================================
// VALIDATE PRODUCT SIZE AND STOCK
// ============================================================

const getProductAndValidateSize =
  async (
    productId,
    requestedSize,
    session = null
  ) => {
    let query =
      Product.findOne({
        id: productId
      });

    if (
      session
    ) {
      query =
        query.session(
          session
        );
    }

    const product =
      await query;

    if (!product) {
      return {
        error: {
          status: 404,
          message:
            "Product not found."
        }
      };
    }

    const productSize =
      findProductSize(
        product,
        requestedSize
      );

    if (!productSize) {
      return {
        error: {
          status: 400,
          message:
            "Selected size is not available."
        }
      };
    }

    const stock =
      Number(
        productSize.stock
      );

    if (
      !Number.isInteger(
        stock
      ) ||
      stock < 0 ||
      stock > MAX_STOCK
    ) {
      return {
        error: {
          status: 500,
          message:
            `Product ${product.name} has invalid stock information.`
        }
      };
    }

    return {
      product,
      productSize,
      stock
    };
  };


// ============================================================
// ORDER ID GENERATOR
// ============================================================

const generateUniqueOrderId =
  async (
    session
  ) => {
    /*
     * Generate a professional order ID.
     *
     * Format:
     *
     * ORD-YYYYMMDD-XXXXXX
     *
     * Example:
     *
     * ORD-20260914-583214
     *
     * The database unique index on orderId
     * remains the final protection against
     * duplicate IDs.
     *
     * Multiple attempts are made so a normal
     * random collision does not immediately
     * fail the transaction.
     */

    for (
      let attempt = 0;
      attempt < 20;
      attempt += 1
    ) {
      const now =
        new Date();

      const year =
        now.getFullYear();

      const month =
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const day =
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        );

      const datePart =
        `${year}${month}${day}`;

      const randomNumber =
        crypto.randomInt(
          100000,
          1000000
        );

      const randomPart =
        String(
          randomNumber
        );

      const orderId =
        `ORD-${datePart}-${randomPart}`;

      const existingOrder =
        await Order.exists({
          orderId
        }).session(
          session
        );

      if (
        !existingOrder
      ) {
        return orderId;
      }
    }

    throw createApplicationError(
      "Unable to generate a unique order ID.",
      409
    );
  };


// ============================================================
// GET USER ORDERS
// ============================================================

export const getOrders =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user?._id;

      const userCheck =
        await checkUserAccess(
          userId
        );

      if (
        userCheck.error
      ) {
        return res.status(
          userCheck.error.status
        ).json({
          success: false,
          message:
            userCheck.error.message
        });
      }

      const orders =
        await Order.find({
          userId
        }).sort({
          createdAt: -1
        });

      return res.status(
        200
      ).json({
        success: true,
        orders
      });
    } catch (
      error
    ) {
      console.error(
        "Get orders error:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          "Failed to fetch orders."
      });
    }
  };


// ============================================================
// PLACE ORDER
// ============================================================

export const placeOrder =
  async (
    req,
    res
  ) => {
    const session =
      await mongoose.startSession();

    try {
      const userId =
        req.user?._id;

      // ------------------------------------------------------
      // Verify authenticated user
      // ------------------------------------------------------

      const userCheck =
        await checkUserAccess(
          userId
        );

      if (
        userCheck.error
      ) {
        return res.status(
          userCheck.error.status
        ).json({
          success: false,
          message:
            userCheck.error.message
        });
      }

      // ------------------------------------------------------
      // Read request body
      // ------------------------------------------------------

      const body =
        req.body || {};

      const {
        address,
        paymentMethod
      } = body;

      // ------------------------------------------------------
      // Validate address
      // ------------------------------------------------------

      const addressError =
        validateAddress(
          address
        );

      if (
        addressError
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            addressError
        });
      }

      // ------------------------------------------------------
      // Validate payment method
      // ------------------------------------------------------

      const paymentValidation =
        validatePaymentMethod(
          paymentMethod
        );

      if (
        !paymentValidation.valid
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            paymentValidation.message
        });
      }

      const normalizedPaymentMethod =
        paymentValidation.paymentMethod;

      let createdOrder =
        null;

      // ======================================================
      // TRANSACTION
      // ======================================================

      await session.withTransaction(
        async () => {
          // --------------------------------------------------
          // Re-check user INSIDE transaction
          // --------------------------------------------------

          const transactionUserCheck =
            await checkUserAccess(
              userId,
              session
            );

          if (
            transactionUserCheck.error
          ) {
            throw createApplicationError(
              transactionUserCheck.error.message,
              transactionUserCheck.error.status
            );
          }

          // --------------------------------------------------
          // Get user's cart INSIDE transaction
          // --------------------------------------------------

          const cart =
            await Cart.findOne({
              userId
            }).session(
              session
            );

          if (
            !cart ||
            !cart.items ||
            cart.items.size === 0
          ) {
            throw createApplicationError(
              "Your cart is empty.",
              400
            );
          }

          // --------------------------------------------------
          // Convert Mongoose Map to entries
          // --------------------------------------------------

          const cartEntries =
            cart.items instanceof Map
              ? Array.from(
                  cart.items.entries()
                )
              : Object.entries(
                  cart.items
                );

          if (
            cartEntries.length === 0
          ) {
            throw createApplicationError(
              "Your cart is empty.",
              400
            );
          }

          if (
            cartEntries.length >
            MAX_ORDER_ITEMS
          ) {
            throw createApplicationError(
              `An order cannot contain more than ${MAX_ORDER_ITEMS} different items.`,
              400
            );
          }

          // --------------------------------------------------
          // Prepare order items
          // --------------------------------------------------

          const orderItems =
            [];

          let subtotal =
            0;

          // --------------------------------------------------
          // Process every cart item
          // --------------------------------------------------

          for (
            const [
              cartKey,
              cartQuantity
            ] of cartEntries
          ) {
            // ----------------------------------------------
            // Validate cart key
            // ----------------------------------------------

            const cartKeyValidation =
              validateCartKey(
                cartKey
              );

            if (
              !cartKeyValidation.valid
            ) {
              throw createApplicationError(
                cartKeyValidation.message,
                400
              );
            }

            const {
              productId,
              size
            } =
              cartKeyValidation;

            // ----------------------------------------------
            // Validate quantity
            // ----------------------------------------------

            const quantityValidation =
              validateCartQuantity(
                cartQuantity
              );

            if (
              !quantityValidation.valid
            ) {
              throw createApplicationError(
                quantityValidation.message,
                400
              );
            }

            const quantity =
              quantityValidation.quantity;

            // ----------------------------------------------
            // Get current product INSIDE transaction
            // ----------------------------------------------

            const product =
              await Product.findOne({
                id:
                  productId
              }).session(
                session
              );

            if (
              !product
            ) {
              throw createApplicationError(
                `Product ${productId} was not found.`,
                404
              );
            }

            // ----------------------------------------------
            // Validate product name
            // ----------------------------------------------

            const productName =
              normalizeString(
                product.name
              );

            if (
              !productName ||
              productName.length >
                MAX_NAME_LENGTH
            ) {
              throw createApplicationError(
                "Product data is invalid.",
                500
              );
            }

            // ----------------------------------------------
            // Find exact size
            // ----------------------------------------------

            const productSize =
              findProductSize(
                product,
                size
              );

            if (
              !productSize
            ) {
              throw createApplicationError(
                `Size ${size} is not available for ${product.name}.`,
                400
              );
            }

            // ----------------------------------------------
            // Use canonical size stored in database
            // ----------------------------------------------

            const actualSize =
              normalizeString(
                productSize.size
              );

            if (
              !actualSize ||
              actualSize.length >
                MAX_SIZE_LENGTH
            ) {
              throw createApplicationError(
                `Product ${product.name} has invalid size information.`,
                500
              );
            }

            // ----------------------------------------------
            // Validate stock
            // ----------------------------------------------

            const availableStock =
              Number(
                productSize.stock
              );

            if (
              !Number.isInteger(
                availableStock
              ) ||
              availableStock < 0 ||
              availableStock >
                MAX_STOCK
            ) {
              throw createApplicationError(
                `Product ${product.name} has invalid stock information.`,
                500
              );
            }

            // ----------------------------------------------
            // Check current stock
            // ----------------------------------------------

            if (
              availableStock <
              quantity
            ) {
              throw createApplicationError(
                availableStock === 0
                  ? `${product.name} in size ${actualSize} is out of stock.`
                  : `Only ${availableStock} item${availableStock === 1 ? "" : "s"} of ${product.name} in size ${actualSize} ${availableStock === 1 ? "is" : "are"} available.`,
                400
              );
            }

            // ----------------------------------------------
            // Validate product price
            // ----------------------------------------------

            const productPrice =
              Number(
                product.price
              );

            if (
              !Number.isFinite(
                productPrice
              ) ||
              productPrice < 0 ||
              productPrice >
                100000000
            ) {
              throw createApplicationError(
                `Product ${product.name} has invalid pricing.`,
                500
              );
            }

            // ----------------------------------------------
            // Calculate item total
            // ----------------------------------------------

            const itemTotal =
              productPrice *
              quantity;

            if (
              !Number.isFinite(
                itemTotal
              ) ||
              itemTotal < 0
            ) {
              throw createApplicationError(
                "Unable to calculate order total.",
                400
              );
            }

            subtotal +=
              itemTotal;

            if (
              !Number.isFinite(
                subtotal
              ) ||
              subtotal >
                1000000000
            ) {
              throw createApplicationError(
                "Order total is invalid.",
                400
              );
            }

            // ----------------------------------------------
            // ATOMIC INVENTORY DECREASE
            // ----------------------------------------------
            //
            // We already found the canonical size stored
            // in MongoDB above.
            //
            // Therefore we do NOT need $expr or a
            // case-insensitive MongoDB expression here.
            //
            // The query verifies:
            //
            // 1. Correct product
            // 2. Correct canonical size
            // 3. Enough stock
            //
            // MongoDB performs the update atomically.
            // The surrounding transaction guarantees that
            // inventory decrease, order creation and cart
            // clearing succeed together or all roll back.
            // ----------------------------------------------

            const stockUpdate =
              await Product.findOneAndUpdate(
                {
                  id:
                    product.id,

                  sizes: {
                    $elemMatch: {
                      size:
                        actualSize,

                      stock: {
                        $gte:
                          quantity
                      }
                    }
                  }
                },
                {
                  $inc: {
                    "sizes.$.stock":
                      -quantity
                  }
                },
                {
                  new: true,
                  session
                }
              );

            if (
              !stockUpdate
            ) {
              throw createApplicationError(
                `The stock for ${product.name} in size ${actualSize} is no longer available. Please refresh your cart and try again.`,
                409
              );
            }

            // ----------------------------------------------
            // Add trusted database data to order
            // ----------------------------------------------

            orderItems.push({
              productId:
                product.id,

              name:
                product.name,

              image:
                product.image,

              price:
                product.price,

              size:
                actualSize,

              quantity
            });
          }

          // --------------------------------------------------
          // Validate subtotal
          // --------------------------------------------------

          if (
            !Number.isFinite(
              subtotal
            ) ||
            subtotal < 0
          ) {
            throw createApplicationError(
              "Invalid order subtotal.",
              400
            );
          }

          // --------------------------------------------------
          // Delivery fee
          // --------------------------------------------------

          const deliveryFee =
            DELIVERY_FEE;

          const totalAmount =
            subtotal +
            deliveryFee;

          if (
            !Number.isFinite(
              totalAmount
            ) ||
            totalAmount < 0 ||
            totalAmount >
              1000000000
          ) {
            throw createApplicationError(
              "Invalid order total.",
              400
            );
          }

          // --------------------------------------------------
          // Generate safe unique order ID
          // --------------------------------------------------

          const orderId =
            await generateUniqueOrderId(
              session
            );

          // --------------------------------------------------
          // Create order INSIDE transaction
          // --------------------------------------------------

          const orders =
            await Order.create(
              [
                {
                  userId,

                  orderId,

                  items:
                    orderItems,

                  amount:
                    totalAmount,

                  date:
                    new Date().toLocaleString(),

                  status:
                    "Order Placed",

                  address,

                  paymentMethod:
                    normalizedPaymentMethod
                }
              ],
              {
                session
              }
            );

          createdOrder =
            orders[0];

          // --------------------------------------------------
          // Clear cart INSIDE transaction
          // --------------------------------------------------

          cart.items.clear();

          await cart.save({
            session
          });
        }
      );

      // ======================================================
      // TRANSACTION SUCCESS
      // ======================================================

      return res.status(
        201
      ).json({
        success: true,

        message:
          "Order placed successfully.",

        order:
          createdOrder
      });
    } catch (
      error
    ) {
      console.error(
        "Place order error:",
        error
      );

      // ------------------------------------------------------
      // Application validation errors
      // ------------------------------------------------------

      if (
        error?.statusCode
      ) {
        return res.status(
          error.statusCode
        ).json({
          success: false,
          message:
            error.message
        });
      }

      // ------------------------------------------------------
      // Mongoose validation errors
      // ------------------------------------------------------

      if (
        error?.name ===
        "ValidationError"
      ) {
        const validationErrors =
          Object.values(
            error.errors || {}
          ).map(
            (
              validationError
            ) =>
              validationError.message
          );

        return res.status(
          400
        ).json({
          success: false,

          message:
            "Order validation failed.",

          errors:
            validationErrors
        });
      }

      // ------------------------------------------------------
      // Duplicate order ID
      // ------------------------------------------------------

      if (
        error?.code ===
        11000
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Order ID conflict. Please try again."
        });
      }

      // ------------------------------------------------------
      // MongoDB transaction errors
      // ------------------------------------------------------

      if (
        error?.hasErrorLabel?.(
          "TransientTransactionError"
        )
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "The order could not be completed because inventory changed. Please try again."
        });
      }

      // ------------------------------------------------------
      // Unknown transaction commit result
      // ------------------------------------------------------

      if (
        error?.hasErrorLabel?.(
          "UnknownTransactionCommitResult"
        )
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "The order result could not be confirmed. Please check your orders before trying again."
        });
      }

      // ------------------------------------------------------
      // Generic error
      // ------------------------------------------------------

      return res.status(
        500
      ).json({
        success: false,

        message:
          "Failed to place order."
      });
    } finally {
      await session.endSession();
    }
  };


// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelOrder =
  async (
    req,
    res
  ) => {
    const session =
      await mongoose.startSession();

    try {
      const userId =
        req.user?._id;

      // ------------------------------------------------------
      // Verify authenticated user
      // ------------------------------------------------------

      const userCheck =
        await checkUserAccess(
          userId
        );

      if (
        userCheck.error
      ) {
        return res.status(
          userCheck.error.status
        ).json({
          success: false,

          message:
            userCheck.error.message
        });
      }

      // ------------------------------------------------------
      // Validate order ID
      // ------------------------------------------------------

      const orderId =
        normalizeString(
          req.params.orderId
        );

      if (
        !orderId
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Order ID is required."
        });
      }

      if (
        orderId.length >
        MAX_ORDER_ID_LENGTH
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid order ID."
        });
      }

      let cancelledOrder =
        null;

      // ======================================================
      // TRANSACTION
      // ======================================================

      await session.withTransaction(
        async () => {
          // --------------------------------------------------
          // Re-check user INSIDE transaction
          // --------------------------------------------------

          const transactionUserCheck =
            await checkUserAccess(
              userId,
              session
            );

          if (
            transactionUserCheck.error
          ) {
            throw createApplicationError(
              transactionUserCheck.error.message,
              transactionUserCheck.error.status
            );
          }

          // --------------------------------------------------
          // Find order belonging to current user
          // --------------------------------------------------

          const order =
            await Order.findOne({
              orderId,
              userId
            }).session(
              session
            );

          if (
            !order
          ) {
            throw createApplicationError(
              "Order not found.",
              404
            );
          }

          // --------------------------------------------------
          // Already cancelled
          // --------------------------------------------------

          if (
            order.status ===
            "Cancelled"
          ) {
            throw createApplicationError(
              "Order is already cancelled.",
              400
            );
          }

          // --------------------------------------------------
          // Customer cancellation is allowed only while
          // the order is still "Order Placed".
          // --------------------------------------------------

          if (
            order.status !==
            "Order Placed"
          ) {
            throw createApplicationError(
              "This order can no longer be cancelled.",
              400
            );
          }

          // --------------------------------------------------
          // Validate order items
          // --------------------------------------------------

          if (
            !Array.isArray(
              order.items
            ) ||
            order.items.length === 0
          ) {
            throw createApplicationError(
              "This order contains invalid item data and cannot be cancelled safely.",
              409
            );
          }

          if (
            order.items.length >
            MAX_ORDER_ITEMS
          ) {
            throw createApplicationError(
              "This order contains too many items and cannot be cancelled safely.",
              409
            );
          }

          // --------------------------------------------------
          // Restore stock for every exact order item
          // --------------------------------------------------

          for (
            const item of order.items
          ) {
            // ----------------------------------------------
            // Validate stored order item
            // ----------------------------------------------

            if (
              !item ||
              typeof item !==
                "object"
            ) {
              throw createApplicationError(
                "Invalid order item data.",
                409
              );
            }

            const productId =
              normalizeString(
                item.productId
              );

            const size =
              normalizeString(
                item.size
              );

            const quantity =
              Number(
                item.quantity
              );

            if (
              !productId ||
              productId.length >
                MAX_PRODUCT_ID_LENGTH ||
              !size ||
              size.length >
                MAX_SIZE_LENGTH ||
              !Number.isInteger(
                quantity
              ) ||
              quantity < 1 ||
              quantity >
                MAX_QUANTITY_PER_ITEM
            ) {
              throw createApplicationError(
                "Invalid order item data.",
                409
              );
            }

            // ----------------------------------------------
            // Find product INSIDE transaction
            // ----------------------------------------------

            const product =
              await Product.findOne({
                id:
                  productId
              }).session(
                session
              );

            if (
              !product
            ) {
              throw createApplicationError(
                `Product ${productId} no longer exists. The order could not be cancelled safely.`,
                409
              );
            }

            // ----------------------------------------------
            // Find exact size
            // ----------------------------------------------

            const productSize =
              findProductSize(
                product,
                size
              );

            if (
              !productSize
            ) {
              throw createApplicationError(
                `Size ${size} is no longer available for ${product.name}. The order could not be cancelled safely.`,
                409
              );
            }

            const actualSize =
              normalizeString(
                productSize.size
              );

            if (
              !actualSize ||
              actualSize.length >
                MAX_SIZE_LENGTH
            ) {
              throw createApplicationError(
                `Product ${product.name} has invalid size information.`,
                409
              );
            }

            // ----------------------------------------------
            // Validate current stock
            // ----------------------------------------------

            const currentStock =
              Number(
                productSize.stock
              );

            if (
              !Number.isInteger(
                currentStock
              ) ||
              currentStock < 0 ||
              currentStock >
                MAX_STOCK
            ) {
              throw createApplicationError(
                `Product ${product.name} has invalid stock information.`,
                500
              );
            }

            // ----------------------------------------------
            // Prevent stock overflow
            // ----------------------------------------------

            if (
              currentStock +
                quantity >
              MAX_STOCK
            ) {
              throw createApplicationError(
                `Stock restoration for ${product.name} in size ${actualSize} would exceed the allowed inventory limit.`,
                409
              );
            }

            // ----------------------------------------------
            // ATOMIC STOCK RESTORATION
            // ----------------------------------------------
            //
            // The canonical size was already found above,
            // so no $expr is necessary.
            //
            // The query guarantees that the current stock
            // cannot exceed MAX_STOCK after restoration.
            // ----------------------------------------------

            const stockRestore =
              await Product.findOneAndUpdate(
                {
                  id:
                    product.id,

                  sizes: {
                    $elemMatch: {
                      size:
                        actualSize,

                      stock: {
                        $lte:
                          MAX_STOCK -
                          quantity
                      }
                    }
                  }
                },
                {
                  $inc: {
                    "sizes.$.stock":
                      quantity
                  }
                },
                {
                  new: true,
                  session
                }
              );

            if (
              !stockRestore
            ) {
              throw createApplicationError(
                `Unable to restore stock for ${product.name} in size ${actualSize}.`,
                409
              );
            }
          }

          // --------------------------------------------------
          // Mark order cancelled INSIDE same transaction
          // --------------------------------------------------

          const updatedOrder =
            await Order.findOneAndUpdate(
              {
                _id:
                  order._id,

                userId,

                orderId,

                status:
                  "Order Placed"
              },
              {
                $set: {
                  status:
                    "Cancelled"
                }
              },
              {
                new: true,
                session
              }
            );

          if (
            !updatedOrder
          ) {
            /*
             * If another operation changed the order
             * while this transaction was running,
             * abort the transaction so stock restoration
             * is also rolled back.
             */

            throw createApplicationError(
              "The order could not be cancelled because its status changed. Please refresh and try again.",
              409
            );
          }

          cancelledOrder =
            updatedOrder;
        }
      );

      // ======================================================
      // TRANSACTION SUCCESS
      // ======================================================

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Order cancelled successfully.",

        order:
          cancelledOrder
      });
    } catch (
      error
    ) {
      console.error(
        "Cancel order error:",
        error
      );

      // ------------------------------------------------------
      // Application errors
      // ------------------------------------------------------

      if (
        error?.statusCode
      ) {
        return res.status(
          error.statusCode
        ).json({
          success: false,

          message:
            error.message
        });
      }

      // ------------------------------------------------------
      // Mongoose validation errors
      // ------------------------------------------------------

      if (
        error?.name ===
        "ValidationError"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid order data."
        });
      }

      // ------------------------------------------------------
      // Duplicate key / concurrency
      // ------------------------------------------------------

      if (
        error?.code ===
        11000
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "Order conflict. Please refresh and try again."
        });
      }

      // ------------------------------------------------------
      // Transaction conflict
      // ------------------------------------------------------

      if (
        error?.hasErrorLabel?.(
          "TransientTransactionError"
        )
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "The order could not be cancelled because inventory changed. Please try again."
        });
      }

      // ------------------------------------------------------
      // Unknown commit result
      // ------------------------------------------------------

      if (
        error?.hasErrorLabel?.(
          "UnknownTransactionCommitResult"
        )
      ) {
        return res.status(
          409
        ).json({
          success: false,

          message:
            "The cancellation result could not be confirmed. Please refresh your orders and check the order status."
        });
      }

      // ------------------------------------------------------
      // Generic error
      // ------------------------------------------------------

      return res.status(
        500
      ).json({
        success: false,

        message:
          "Failed to cancel order."
      });
    } finally {
      await session.endSession();
    }
  };