import mongoose from "mongoose";


// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      trim: true,
      minlength: [
        1,
        "Product ID cannot be empty"
      ],
      maxlength: [
        100,
        "Product ID cannot exceed 100 characters"
      ]
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [
        1,
        "Product name cannot be empty"
      ],
      maxlength: [
        200,
        "Product name cannot exceed 200 characters"
      ]
    },

    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
      minlength: [
        1,
        "Product image is required"
      ],
      maxlength: [
        5000000,
        "Product image is too large"
      ]
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [
        0,
        "Product price cannot be negative"
      ],
      max: [
        100000000,
        "Product price is too large"
      ],
      validate: {
        validator:
          Number.isFinite,
        message:
          "Product price must be a valid number"
      }
    },

    size: {
      type: String,
      required: [true, "Product size is required"],
      trim: true,
      minlength: [
        1,
        "Product size cannot be empty"
      ],
      maxlength: [
        50,
        "Product size cannot exceed 50 characters"
      ]
    },

    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [
        1,
        "Product quantity must be at least 1"
      ],
      max: [
        99,
        "Product quantity cannot exceed 99"
      ],
      validate: {
        validator:
          Number.isInteger,
        message:
          "Product quantity must be a whole number"
      }
    }
  },
  {
    _id: false,
    strict: true
  }
);


// ============================================================
// ORDER SCHEMA
// ============================================================

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "User ID is required"
      ]
    },

    orderId: {
      type: String,
      required: [
        true,
        "Order ID is required"
      ],
      unique: true,
      trim: true,
      minlength: [
        1,
        "Order ID cannot be empty"
      ],
      maxlength: [
        50,
        "Order ID cannot exceed 50 characters"
      ]
    },

    items: {
      type: [orderItemSchema],
      required: [
        true,
        "Order items are required"
      ],
      default: [],

      validate: [
        {
          validator: (items) =>
            Array.isArray(items) &&
            items.length > 0,

          message:
            "An order must contain at least one item"
        },

        {
          validator: (items) =>
            Array.isArray(items) &&
            items.length <= 50,

          message:
            "An order cannot contain more than 50 items"
        }
      ]
    },

    amount: {
      type: Number,
      required: [
        true,
        "Order amount is required"
      ],
      min: [
        0,
        "Order amount cannot be negative"
      ],
      max: [
        1000000000,
        "Order amount is too large"
      ],
      validate: {
        validator:
          Number.isFinite,
        message:
          "Order amount must be a valid number"
      }
    },

    date: {
      type: String,
      required: [
        true,
        "Order date is required"
      ],
      trim: true,
      minlength: [
        1,
        "Order date cannot be empty"
      ],
      maxlength: [
        100,
        "Order date cannot exceed 100 characters"
      ]
    },

    status: {
      type: String,
      required: [
        true,
        "Order status is required"
      ],
      enum: {
        values: [
          "Order Placed",
          "Processing",
          "Packing",
          "Shipped",
          "Out for delivery",
          "Delivered",
          "Cancelled"
        ],
        message:
          "Invalid order status"
      },
      default: "Order Placed",
      trim: true
    },

    address: {
      type:
        mongoose.Schema.Types.Mixed,
      required: [
        true,
        "Delivery address is required"
      ]
    },

    paymentMethod: {
      type: String,
      required: [
        true,
        "Payment method is required"
      ],
      enum: {
        values: [
          "COD"
        ],
        message:
          "Invalid payment method"
      },
      trim: true,
      default: "COD"
    }
  },
  {
    timestamps: true,
    strict: true
  }
);


// ============================================================
// DATABASE INDEXES
// ============================================================

// Unique order ID lookup.
//
// The `unique: true` option on orderId already creates
// the unique index required for this field.


// User's orders, newest first.
//
// This supports queries such as:
// Order.find({ userId }).sort({ createdAt: -1 })

orderSchema.index(
  {
    userId: 1,
    createdAt: -1
  }
);


// Admin order filtering by status,
// with newest orders first.
//
// This supports queries such as:
// Order.find({ status }).sort({ createdAt: -1 })

orderSchema.index(
  {
    status: 1,
    createdAt: -1
  }
);


// Admin/general order listing,
// newest orders first.
//
// This supports queries such as:
// Order.find().sort({ createdAt: -1 })

orderSchema.index(
  {
    createdAt: -1
  }
);


// ============================================================
// ORDER MODEL
// ============================================================

const Order =
  mongoose.model(
    "Order",
    orderSchema
  );


export default Order;