
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";


/*
|--------------------------------------------------------------------------
| Order Status Configuration
|--------------------------------------------------------------------------
|
| Order Placed
|      ↓
| Processing
|      ↓
| Packing
|      ↓
| Shipped
|      ↓
| Out for delivery
|      ↓
| Delivered
|
| Cancellation is allowed ONLY before Shipped:
|
| Order Placed
| Processing
| Packing
|
|--------------------------------------------------------------------------
*/

const ORDER_STATUSES = [
  "Order Placed",
  "Processing",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered",
  "Cancelled"
];

const CANCELLABLE_STATUSES = [
  "Order Placed",
  "Processing",
  "Packing"
];

const STATUS_TRANSITIONS = {
  "Order Placed": [
    "Processing",
    "Packing"
  ],

  Processing: [
    "Packing"
  ],

  Packing: [
    "Shipped"
  ],

  Shipped: [
    "Out for delivery"
  ],

  "Out for delivery": [
    "Delivered"
  ],

  Delivered: [],

  Cancelled: []
};


/*
|--------------------------------------------------------------------------
| Inventory Configuration
|--------------------------------------------------------------------------
*/

const MAX_STOCK = 1000000;

const MAX_ORDER_ITEMS = 50;

const MAX_PRODUCT_ID_LENGTH = 100;

const MAX_SIZE_LENGTH = 50;

const MAX_QUANTITY_PER_ITEM = 99;


/*
|--------------------------------------------------------------------------
| Helper: Validate MongoDB ObjectId
|--------------------------------------------------------------------------
*/

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(
    value
  );
};


/*
|--------------------------------------------------------------------------
| Helper: Normalize String
|--------------------------------------------------------------------------
*/

const normalizeString = (value) => {
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


/*
|--------------------------------------------------------------------------
| Helper: Normalize Size For Comparison
|--------------------------------------------------------------------------
*/

const normalizeSizeForComparison = (
  size
) => {
  return normalizeString(
    size
  ).toLowerCase();
};


/*
|--------------------------------------------------------------------------
| Helper: Format Order
|--------------------------------------------------------------------------
|
| Supports both populated and unpopulated userId values.
|
| Customer email and phone are included for the admin
| orders list and individual order details page.
|
|--------------------------------------------------------------------------
*/

const formatOrder = (order) => {
  const populatedUser =
    order.userId &&
    typeof order.userId === "object"
      ? order.userId
      : null;

  const userId =
    populatedUser
      ? populatedUser._id
      : order.userId;

  return {
    id: String(order._id),

    orderId: order.orderId,

    userId: userId
      ? String(userId)
      : null,

    email:
      populatedUser?.email || "",

    phone:
      populatedUser?.phone || "",

    items: order.items,

    amount: order.amount,

    total: order.amount,

    date: order.date,

    status: order.status,

    address: order.address,

    paymentMethod: order.paymentMethod,

    createdAt: order.createdAt,

    updatedAt: order.updatedAt
  };
};


/*
|--------------------------------------------------------------------------
| Helper: Create Application Error
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Helper: Find Exact Product Size
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Helper: Restore Order Inventory
|--------------------------------------------------------------------------
|
| Restores stock for every item in an order.
|
| IMPORTANT:
|
| This function MUST be called inside an active MongoDB
| transaction/session.
|
| The exact product ID, exact size and exact quantity stored
| inside the order are used.
|
| If any item cannot be restored safely, the transaction
| will fail and all previous stock changes will roll back.
|
|--------------------------------------------------------------------------
*/

const restoreOrderInventory = async (
  order,
  session
) => {
  if (
    !order
  ) {
    throw createApplicationError(
      "Order not found.",
      404
    );
  }

  if (
    !Array.isArray(
      order.items
    ) ||
    order.items.length === 0
  ) {
    throw createApplicationError(
      "This order contains no valid items to restore.",
      409
    );
  }

  if (
    order.items.length >
    MAX_ORDER_ITEMS
  ) {
    throw createApplicationError(
      "This order contains too many items to restore safely.",
      409
    );
  }


  /*
   * Restore every individual order item.
   */

  for (
    const item of order.items
  ) {
    /*
     * Validate stored order item.
     */

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


    /*
     * Extract trusted values from the
     * existing order document.
     */

    const productId =
      normalizeString(
        item.productId
      );

    const requestedSize =
      normalizeString(
        item.size
      );

    const quantity =
      Number(
        item.quantity
      );


    /*
     * Validate product ID.
     */

    if (
      !productId ||
      productId.length >
        MAX_PRODUCT_ID_LENGTH
    ) {
      throw createApplicationError(
        "Invalid product ID in order.",
        409
      );
    }


    /*
     * Validate size.
     */

    if (
      !requestedSize ||
      requestedSize.length >
        MAX_SIZE_LENGTH
    ) {
      throw createApplicationError(
        "Invalid product size in order.",
        409
      );
    }


    /*
     * Validate quantity.
     */

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      quantity >
        MAX_QUANTITY_PER_ITEM
    ) {
      throw createApplicationError(
        "Invalid product quantity in order.",
        409
      );
    }


    /*
     * Find the current product.
     *
     * The query is executed inside the same
     * transaction that will restore the stock.
     */

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
        `Product ${productId} no longer exists. Stock could not be restored safely.`,
        409
      );
    }


    /*
     * Find the exact size.
     */

    const productSize =
      findProductSize(
        product,
        requestedSize
      );


    if (
      !productSize
    ) {
      throw createApplicationError(
        `Size ${requestedSize} is no longer available for ${product.name}. Stock could not be restored safely.`,
        409
      );
    }


    /*
     * Get the canonical size stored
     * in the database.
     */

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


    /*
     * Validate current stock.
     */

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


    /*
     * Prevent stock overflow.
     */

    if (
      currentStock +
        quantity >
      MAX_STOCK
    ) {
      throw createApplicationError(
        `Restoring stock for ${product.name} in size ${actualSize} would exceed the maximum stock limit.`,
        409
      );
    }


    /*
     * ATOMIC INVENTORY RESTORATION
     *
     * The exact product and size must still exist,
     * and stock must remain within the allowed limit.
     *
     * MongoDB performs the update atomically.
     */

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


    /*
     * If no document was updated,
     * the inventory state changed unexpectedly.
     */

    if (
      !stockRestore
    ) {
      throw createApplicationError(
        `Unable to restore stock for ${product.name} in size ${actualSize}. Please try again.`,
        409
      );
    }
  }
};


/*
|--------------------------------------------------------------------------
| Get All Orders
|--------------------------------------------------------------------------
|
| Returns all orders, including cancelled orders.
|
| Cancelled orders are filtered into their own tab
| by the frontend.
|
| Customer email and phone are populated from User.
|
|--------------------------------------------------------------------------
*/

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({})
        .populate(
          "userId",
          "email phone"
        )
        .sort({
          createdAt: -1
        })
        .lean();

    const orderList =
      orders.map(
        (order) =>
          formatOrder(
            order
          )
      );

    return res.status(
      200
    ).json({
      success: true,
      orders:
        orderList
    });

  } catch (
    error
  ) {
    console.error(
      "Get all orders error:",
      error
    );

    return res.status(
      500
    ).json({
      success: false,
      message:
        "Failed to load orders"
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get Single Order By MongoDB ID
|--------------------------------------------------------------------------
|
| Used by the admin order details page.
|
| IMPORTANT:
|
| This endpoint uses the existing MongoDB _id.
| It does not create another order ID.
|
|--------------------------------------------------------------------------
*/

export const getOrderById = async (
  req,
  res
) => {
  try {
    const orderId =
      String(
        req.params.id || ""
      ).trim();


    /*
     * Validate MongoDB order ID.
     */

    if (
      !orderId
    ) {
      return res.status(
        400
      ).json({
        success: false,
        message:
          "Order ID is required"
      });
    }


    if (
      !isValidObjectId(
        orderId
      )
    ) {
      return res.status(
        400
      ).json({
        success: false,
        message:
          "Invalid order ID"
      });
    }


    /*
     * Find the order using MongoDB _id.
     *
     * Populate customer information.
     */

    const order =
      await Order.findById(
        orderId
      )
        .populate(
          "userId",
          "email phone"
        )
        .lean();


    if (
      !order
    ) {
      return res.status(
        404
      ).json({
        success: false,
        message:
          "Order not found"
      });
    }


    return res.status(
      200
    ).json({
      success: true,

      order:
        formatOrder(
          order
        )
    });

  } catch (
    error
  ) {
    console.error(
      "Get order by ID error:",
      error
    );

    return res.status(
      500
    ).json({
      success: false,
      message:
        "Failed to load order details"
    });
  }
};


/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
|
| This endpoint handles normal status progression only.
|
| Cancellation MUST use the dedicated cancelOrder endpoint.
|
| This prevents admins from changing an order to Cancelled
| without restoring its inventory.
|
|--------------------------------------------------------------------------
*/

export const updateOrderStatus =
  async (
    req,
    res
  ) => {
    const session =
      await mongoose.startSession();

    try {
      const orderId =
        String(
          req.params.orderId ||
            ""
        ).trim();

      const requestedStatus =
        String(
          req.body?.status ||
            ""
        ).trim();


      /*
       * Validate MongoDB order ID.
       */

      if (
        !orderId
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Order ID is required"
        });
      }


      if (
        !isValidObjectId(
          orderId
        )
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Invalid order ID"
        });
      }


      /*
       * Validate requested status.
       */

      if (
        !ORDER_STATUSES.includes(
          requestedStatus
        )
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Invalid order status"
        });
      }


      /*
       * Cancellation must use the dedicated endpoint.
       */

      if (
        requestedStatus ===
        "Cancelled"
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Please use the cancel order action to cancel an order."
        });
      }


      let updatedOrder =
        null;


      /*
       * -------------------------------------------------------
       * TRANSACTION
       * -------------------------------------------------------
       *
       * Normal status changes are performed inside
       * a transaction.
       *
       * Cancellation is handled separately.
       */

      await session.withTransaction(
        async () => {
          /*
           * Find order INSIDE transaction.
           */

          const order =
            await Order.findById(
              orderId
            ).session(
              session
            );


          if (
            !order
          ) {
            throw createApplicationError(
              "Order not found",
              404
            );
          }


          /*
           * Do not allow changes to delivered
           * or cancelled orders.
           */

          if (
            order.status ===
            "Delivered"
          ) {
            throw createApplicationError(
              "A delivered order cannot be changed.",
              400
            );
          }


          if (
            order.status ===
            "Cancelled"
          ) {
            throw createApplicationError(
              "A cancelled order cannot be changed.",
              400
            );
          }


          /*
           * Prevent updating to the same status.
           */

          if (
            order.status ===
            requestedStatus
          ) {
            throw createApplicationError(
              "Order is already in this status.",
              400
            );
          }


          /*
           * Validate status transition.
           *
           * This prevents an admin from accidentally
           * moving an order backwards.
           */

          const allowedNextStatuses =
            STATUS_TRANSITIONS[
              order.status
            ] || [];


          if (
            !allowedNextStatuses.includes(
              requestedStatus
            )
          ) {
            throw createApplicationError(
              `Order cannot move from "${order.status}" to "${requestedStatus}".`,
              400
            );
          }


          /*
           * Update order status.
           */

          order.status =
            requestedStatus;


          /*
           * Save status inside the same transaction.
           */

          await order.save({
            session
          });


          /*
           * Keep the updated order
           * for the response.
           */

          updatedOrder =
            order;
        }
      );


      /*
       * -------------------------------------------------------
       * TRANSACTION SUCCESS
       * -------------------------------------------------------
       */

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Order status updated successfully",

        order: {
          id:
            String(
              updatedOrder._id
            ),

          orderId:
            updatedOrder.orderId,

          status:
            updatedOrder.status
        }
      });

    } catch (
      error
    ) {
      console.error(
        "Update order status error:",
        error
      );


      /*
       * Application error.
       */

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


      /*
       * Mongoose validation error.
       */

      if (
        error?.name ===
        "ValidationError"
      ) {
        const validationErrors =
          Object.values(
            error.errors ||
              {}
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
            "Order validation failed",
          errors:
            validationErrors
        });
      }


      /*
       * Invalid ObjectId / CastError.
       */

      if (
        error?.name ===
        "CastError"
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Invalid order ID"
        });
      }


      /*
       * Transaction conflict.
       */

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
            "The order could not be updated because inventory changed. Please try again."
        });
      }


      /*
       * Unknown transaction commit result.
       */

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
            "The order update result could not be confirmed. Please refresh the orders page and check the order status."
        });
      }


      /*
       * Unexpected server error.
       */

      return res.status(
        500
      ).json({
        success: false,
        message:
          "Failed to update order status"
      });

    } finally {
      await session.endSession();
    }
  };


/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
|
| The order is NOT permanently deleted.
|
| The order remains in MongoDB for:
|
| - Order history
| - Admin records
| - Customer records
| - Future reporting
|
| Cancellation is permitted ONLY when the current status is:
|
| - Order Placed
| - Processing
| - Packing
|
| When an admin cancels an order:
|
| 1. The exact product/size quantities are restored.
| 2. The order status becomes Cancelled.
|
| Both operations happen inside the same MongoDB transaction.
|
|--------------------------------------------------------------------------
*/

export const cancelOrder = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const orderId =
      String(
        req.params.orderId ||
          ""
      ).trim();


    /*
     * Validate MongoDB order ID.
     */

    if (
      !orderId
    ) {
      return res.status(
        400
      ).json({
        success: false,
        message:
          "Order ID is required"
      });
    }


    if (
      !isValidObjectId(
        orderId
      )
    ) {
      return res.status(
        400
      ).json({
        success: false,
        message:
          "Invalid order ID"
      });
    }


    let cancelledOrder =
      null;


    /*
     * -------------------------------------------------------
     * TRANSACTION
     * -------------------------------------------------------
     */

    await session.withTransaction(
      async () => {
        /*
         * Find order INSIDE transaction.
         */

        const order =
          await Order.findById(
            orderId
          ).session(
            session
          );


        if (
          !order
        ) {
          throw createApplicationError(
            "Order not found",
            404
          );
        }


        /*
         * Do not cancel an already cancelled order.
         */

        if (
          order.status ===
          "Cancelled"
        ) {
          throw createApplicationError(
            "Order is already cancelled",
            400
          );
        }


        /*
         * Enforce the cancellation window.
         *
         * Shipped, Out for delivery and Delivered
         * orders cannot be cancelled.
         */

        if (
          !CANCELLABLE_STATUSES.includes(
            order.status
          )
        ) {
          throw createApplicationError(
            `This order cannot be cancelled because its current status is "${order.status}". Orders can only be cancelled before they are shipped.`,
            400
          );
        }


        /*
         * ---------------------------------------------------
         * RESTORE INVENTORY
         * ---------------------------------------------------
         *
         * This happens BEFORE changing the order status.
         *
         * If restoration fails, the transaction aborts and
         * the order remains in its original status.
         */

        await restoreOrderInventory(
          order,
          session
        );


        /*
         * Cancel the order.
         *
         * We intentionally preserve the order
         * document instead of deleting it.
         */

        order.status =
          "Cancelled";


        /*
         * Save the cancelled order
         * inside the same transaction.
         */

        await order.save({
          session
        });


        /*
         * Keep the updated order
         * for the response.
         */

        cancelledOrder =
          order;
      }
    );


    /*
     * -------------------------------------------------------
     * TRANSACTION SUCCESS
     * -------------------------------------------------------
     */

    return res.status(
      200
    ).json({
      success: true,

      message:
        "Order cancelled successfully",

      order: {
        id:
          String(
            cancelledOrder._id
          ),

        orderId:
          cancelledOrder.orderId,

        status:
          cancelledOrder.status
      }
    });

  } catch (
    error
  ) {
    console.error(
      "Cancel order error:",
      error
    );


    /*
     * Application error.
     */

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


    /*
     * Mongoose validation error.
     */

    if (
      error?.name ===
      "ValidationError"
    ) {
      const validationErrors =
        Object.values(
          error.errors ||
            {}
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
          "Order validation failed",
        errors:
          validationErrors
      });
    }


    /*
     * Invalid ObjectId / CastError.
     */

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(
        400
      ).json({
        success: false,
        message:
          "Invalid order ID"
      });
    }


    /*
     * Transaction conflict.
     */

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


    /*
     * Unknown transaction commit result.
     */

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
          "The cancellation result could not be confirmed. Please refresh the orders page and check the order status."
      });
    }


    /*
     * Unexpected server error.
     */

    return res.status(
      500
    ).json({
      success: false,
      message:
        "Failed to cancel order"
    });

  } finally {
    await session.endSession();
  }
};