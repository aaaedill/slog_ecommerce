import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";


/*
|--------------------------------------------------------------------------
| Order Status Configuration
|--------------------------------------------------------------------------
|
| The status flow is intentionally controlled on the backend.
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
| An order can also be cancelled while it is still active.
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

const STATUS_TRANSITIONS = {
  "Order Placed": [
    "Processing",
    "Packing",
    "Cancelled"
  ],

  Processing: [
    "Packing",
    "Cancelled"
  ],

  Packing: [
    "Shipped",
    "Cancelled"
  ],

  Shipped: [
    "Out for delivery",
    "Cancelled"
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
| Keeps the response format compatible with the existing
| Admin Orders frontend.
|
|--------------------------------------------------------------------------
*/

const formatOrder = (order) => {
  return {
    id: String(order._id),
    orderId: order.orderId,
    userId: order.userId
      ? String(order.userId)
      : null,
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
|
| Finds the actual canonical size stored in MongoDB.
|
| This also keeps compatibility with the existing per-size
| stock structure:
|
| sizes: [
|   {
|     size: "S",
|     stock: 5
|   },
|   {
|     size: "M",
|     stock: 10
|   }
| ]
|
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
| Example:
|
| Order item:
|
| {
|   productId: "12",
|   size: "M",
|   quantity: 2
| }
|
| Product:
|
| {
|   id: "12",
|   sizes: [
|     {
|       size: "M",
|       stock: 5
|     }
|   ]
| }
|
| Result:
|
| M stock becomes 7.
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
     *
     * Example:
     *
     * Current stock = 999999
     * Quantity      = 2
     *
     * Result would be 1000001.
     *
     * That is rejected.
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
     * ------------------------------------------------------
     *
     * We use the canonical size from MongoDB.
     *
     * No $expr is required.
     *
     * The $elemMatch query guarantees that:
     *
     * 1. The correct product is being updated.
     * 2. The exact size exists.
     * 3. Current stock is low enough to safely increase it.
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
*/

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({})
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
| Update Order Status
|--------------------------------------------------------------------------
*/

export const updateOrderStatus =
  async (
    req,
    res
  ) => {
    /*
     * A transaction is required here because
     * changing an order to "Cancelled" must restore
     * inventory atomically with the status change.
     */

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


      let updatedOrder =
        null;


      /*
       * -------------------------------------------------------
       * TRANSACTION
       * -------------------------------------------------------
       *
       * If cancellation occurs:
       *
       *     restore stock
       *          +
       *     set status Cancelled
       *
       * happen together.
       *
       * If either operation fails,
       * MongoDB rolls everything back.
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
           * Do not allow changes to completed
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
           * ---------------------------------------------------
           * ADMIN CANCELLATION INVENTORY RESTORATION
           * ---------------------------------------------------
           *
           * Only restore inventory when the requested
           * new status is actually "Cancelled".
           *
           * This prevents stock from being restored when
           * an admin simply moves the order through:
           *
           * Processing
           * Packing
           * Shipped
           * Out for delivery
           * Delivered
           */

          if (
            requestedStatus ===
            "Cancelled"
          ) {
            await restoreOrderInventory(
              order,
              session
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
| We do NOT permanently delete the order.
|
| The order remains in MongoDB for:
|
| - Order history
| - Admin records
| - Customer records
| - Future reporting
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
  /*
   * A transaction is required because
   * inventory restoration and cancellation
   * must happen together.
   */

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
         * Do not cancel delivered orders.
         */

        if (
          order.status ===
          "Delivered"
        ) {
          throw createApplicationError(
            "A delivered order cannot be cancelled",
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