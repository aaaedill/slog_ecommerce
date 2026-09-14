import mongoose from "mongoose";

const productSizeSchema = new mongoose.Schema(
  {
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

    stock: {
      type: Number,
      required: [true, "Size stock is required"],
      default: 0,
      min: [
        0,
        "Size stock cannot be negative"
      ],
      max: [
        1000000,
        "Size stock is too large"
      ],
      validate: {
        validator: Number.isInteger,
        message:
          "Size stock must be a whole number"
      }
    }
  },
  {
    _id: false
  }
);

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Product ID is required"],
      unique: true,
      trim: true,
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
        2,
        "Product name must be at least 2 characters"
      ],
      maxlength: [
        200,
        "Product name cannot exceed 200 characters"
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
        validator: Number.isFinite,
        message:
          "Product price must be a valid number"
      }
    },

    description: {
      type: String,
      required: [
        true,
        "Product description is required"
      ],
      trim: true,
      minlength: [
        1,
        "Product description cannot be empty"
      ],
      maxlength: [
        2000,
        "Product description cannot exceed 2000 characters"
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

    category: {
      type: String,
      required: [
        true,
        "Product category is required"
      ],
      trim: true,
      minlength: [
        1,
        "Product category cannot be empty"
      ],
      maxlength: [
        100,
        "Product category cannot exceed 100 characters"
      ]
    },

    sizes: {
      type: [productSizeSchema],
      default: [],
      validate: [
        {
          validator: (sizes) =>
            Array.isArray(sizes) &&
            sizes.length <= 20,
          message:
            "A product cannot have more than 20 sizes"
        },
        {
          validator: (sizes) => {
            if (!Array.isArray(sizes)) {
              return false;
            }

            const normalizedSizes =
              sizes.map((item) =>
                String(item.size)
                  .trim()
                  .toLowerCase()
              );

            return (
              new Set(normalizedSizes)
                .size ===
              normalizedSizes.length
            );
          },
          message:
            "A product cannot have duplicate sizes"
        }
      ]
    },

    rating: {
      type: Number,
      default: 0,
      min: [
        0,
        "Rating cannot be below 0"
      ],
      max: [
        5,
        "Rating cannot exceed 5"
      ],
      validate: {
        validator: Number.isFinite,
        message:
          "Rating must be a valid number"
      }
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;