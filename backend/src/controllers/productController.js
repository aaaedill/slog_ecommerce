import Product from "../models/Product.js";

const MAX_PRODUCT_ID_LENGTH = 100;
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_IMAGE_LENGTH = 5000000;
const MAX_SIZES = 20;
const MAX_SIZE_LENGTH = 50;
const MAX_STOCK = 1000000;

const isNonEmptyString = (value) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
};

const isFiniteNumber = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
};

const isInteger = (value) => {
  return (
    typeof value === "number" &&
    Number.isInteger(value)
  );
};

const validateProductSizes = (
  sizes
) => {
  const errors = [];

  if (sizes === undefined) {
    return errors;
  }

  if (!Array.isArray(sizes)) {
    errors.push(
      "Product sizes must be an array."
    );

    return errors;
  }

  if (sizes.length > MAX_SIZES) {
    errors.push(
      `A product cannot have more than ${MAX_SIZES} sizes.`
    );

    return errors;
  }

  const normalizedSizeNames = [];

  sizes.forEach((sizeItem, index) => {
    if (
      !sizeItem ||
      typeof sizeItem !== "object" ||
      Array.isArray(sizeItem)
    ) {
      errors.push(
        `Size ${index + 1} must contain a size and stock value.`
      );

      return;
    }

    const {
      size,
      stock
    } = sizeItem;

    if (!isNonEmptyString(size)) {
      errors.push(
        `Size ${index + 1} must have a valid size name.`
      );
    } else if (
      size.trim().length >
      MAX_SIZE_LENGTH
    ) {
      errors.push(
        `Size ${index + 1} cannot exceed ${MAX_SIZE_LENGTH} characters.`
      );
    }

    if (!isInteger(stock)) {
      errors.push(
        `Stock for size ${index + 1} must be a whole number.`
      );
    } else if (stock < 0) {
      errors.push(
        `Stock for size ${index + 1} cannot be negative.`
      );
    } else if (stock > MAX_STOCK) {
      errors.push(
        `Stock for size ${index + 1} is too large.`
      );
    }

    if (isNonEmptyString(size)) {
      normalizedSizeNames.push(
        size.trim().toLowerCase()
      );
    }
  });

  const uniqueSizes =
    new Set(normalizedSizeNames);

  if (
    uniqueSizes.size !==
    normalizedSizeNames.length
  ) {
    errors.push(
      "A product cannot have duplicate sizes."
    );
  }

  return errors;
};

const validateProductFields = ({
  id,
  name,
  price,
  description,
  image,
  category,
  sizes,
  rating
}) => {
  const errors = [];

  if (id !== undefined) {
    if (!isNonEmptyString(id)) {
      errors.push(
        "Product ID is required."
      );
    } else if (
      id.trim().length >
      MAX_PRODUCT_ID_LENGTH
    ) {
      errors.push(
        `Product ID cannot exceed ${MAX_PRODUCT_ID_LENGTH} characters.`
      );
    }
  }

  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      errors.push(
        "Product name cannot be empty."
      );
    } else if (
      name.trim().length >
      MAX_NAME_LENGTH
    ) {
      errors.push(
        `Product name cannot exceed ${MAX_NAME_LENGTH} characters.`
      );
    }
  }

  if (price !== undefined) {
    if (!isFiniteNumber(price)) {
      errors.push(
        "Product price must be a valid number."
      );
    } else if (price < 0) {
      errors.push(
        "Product price cannot be negative."
      );
    } else if (
      price > 100000000
    ) {
      errors.push(
        "Product price is too large."
      );
    }
  }

  if (description !== undefined) {
    if (!isNonEmptyString(description)) {
      errors.push(
        "Product description cannot be empty."
      );
    } else if (
      description.trim().length >
      MAX_DESCRIPTION_LENGTH
    ) {
      errors.push(
        `Product description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
      );
    }
  }

  if (image !== undefined) {
    if (!isNonEmptyString(image)) {
      errors.push(
        "Product image is required."
      );
    } else if (
      image.trim().length >
      MAX_IMAGE_LENGTH
    ) {
      errors.push(
        "Product image is too large."
      );
    }
  }

  if (category !== undefined) {
    if (!isNonEmptyString(category)) {
      errors.push(
        "Product category cannot be empty."
      );
    } else if (
      category.trim().length >
      MAX_CATEGORY_LENGTH
    ) {
      errors.push(
        `Product category cannot exceed ${MAX_CATEGORY_LENGTH} characters.`
      );
    }
  }

  if (sizes !== undefined) {
    errors.push(
      ...validateProductSizes(
        sizes
      )
    );
  }

  if (rating !== undefined) {
    if (!isFiniteNumber(rating)) {
      errors.push(
        "Rating must be a valid number."
      );
    } else if (
      rating < 0 ||
      rating > 5
    ) {
      errors.push(
        "Rating must be between 0 and 5."
      );
    }
  }

  return errors;
};

const normalizeProductSizes = (
  sizes
) => {
  if (!Array.isArray(sizes)) {
    return [];
  }

  return sizes.map(
    (sizeItem) => ({
      size: sizeItem.size.trim(),
      stock: sizeItem.stock
    })
  );
};

const handleMongooseError = (
  error,
  res,
  action
) => {
  console.error(
    `${action} product error:`,
    error
  );

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "A product with this ID already exists."
    });
  }

  if (
    error?.name ===
    "ValidationError"
  ) {
    const validationErrors =
      Object.values(
        error.errors
      ).map(
        (validationError) =>
          validationError.message
      );

    return res.status(400).json({
      success: false,
      message:
        "Product validation failed.",
      errors: validationErrors
    });
  }

  if (
    error?.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid product data."
    });
  }

  return res.status(500).json({
    success: false,
    message:
      `Failed to ${action.toLowerCase()} product.`
  });
};

// GET ALL PRODUCTS
export const getProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find().sort({
        id: 1
      });

    return res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch products."
    });
  }
};

// GET SINGLE PRODUCT
export const getProductById =
  async (req, res) => {
    try {
      const productId =
        String(
          req.params.id || ""
        ).trim();

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required."
        });
      }

      if (
        productId.length >
        MAX_PRODUCT_ID_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID."
        });
      }

      const product =
        await Product.findOne({
          id: productId
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found."
        });
      }

      return res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      console.error(
        "Get product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch product."
      });
    }
  };

// CREATE PRODUCT
export const createProduct =
  async (req, res) => {
    try {
      const body = req.body || {};

      const {
        id,
        name,
        price,
        description,
        image,
        category,
        sizes,
        rating
      } = body;

      if (
        !isNonEmptyString(id) ||
        !isNonEmptyString(name) ||
        price === undefined ||
        !isNonEmptyString(
          description
        ) ||
        !isNonEmptyString(image) ||
        !isNonEmptyString(category)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All required product fields must be provided."
        });
      }

      const validationErrors =
        validateProductFields({
          id,
          name,
          price,
          description,
          image,
          category,
          sizes,
          rating
        });

      if (
        validationErrors.length > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed.",
          errors: validationErrors
        });
      }

      const normalizedId =
        id.trim();

      const existingProduct =
        await Product.findOne({
          id: normalizedId
        });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message:
            "A product with this ID already exists."
        });
      }

      const normalizedSizes =
        normalizeProductSizes(
          sizes
        );

      const product =
        await Product.create({
          id: normalizedId,
          name: name.trim(),
          price,
          description:
            description.trim(),
          image: image.trim(),
          category: category.trim(),
          sizes:
            normalizedSizes,
          rating:
            rating ?? 0
        });

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully.",
        product
      });
    } catch (error) {
      return handleMongooseError(
        error,
        res,
        "Create"
      );
    }
  };

// UPDATE PRODUCT
export const updateProduct =
  async (req, res) => {
    try {
      const productId =
        String(
          req.params.id || ""
        ).trim();

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required."
        });
      }

      if (
        productId.length >
        MAX_PRODUCT_ID_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID."
        });
      }

      const body = req.body || {};

      const {
        name,
        price,
        description,
        image,
        category,
        sizes,
        rating
      } = body;

      const hasUpdateField =
        name !== undefined ||
        price !== undefined ||
        description !== undefined ||
        image !== undefined ||
        category !== undefined ||
        sizes !== undefined ||
        rating !== undefined;

      if (!hasUpdateField) {
        return res.status(400).json({
          success: false,
          message:
            "At least one product field must be provided for update."
        });
      }

      const validationErrors =
        validateProductFields({
          name,
          price,
          description,
          image,
          category,
          sizes,
          rating
        });

      if (
        validationErrors.length > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed.",
          errors: validationErrors
        });
      }

      const product =
        await Product.findOne({
          id: productId
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found."
        });
      }

      if (name !== undefined) {
        product.name =
          name.trim();
      }

      if (price !== undefined) {
        product.price =
          price;
      }

      if (
        description !==
        undefined
      ) {
        product.description =
          description.trim();
      }

      if (image !== undefined) {
        product.image =
          image.trim();
      }

      if (category !== undefined) {
        product.category =
          category.trim();
      }

      if (sizes !== undefined) {
        product.sizes =
          normalizeProductSizes(
            sizes
          );
      }

      if (rating !== undefined) {
        product.rating =
          rating;
      }

      await product.save();

      return res.status(200).json({
        success: true,
        message:
          "Product updated successfully.",
        product
      });
    } catch (error) {
      return handleMongooseError(
        error,
        res,
        "Update"
      );
    }
  };

// DELETE PRODUCT
export const deleteProduct =
  async (req, res) => {
    try {
      const productId =
        String(
          req.params.id || ""
        ).trim();

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required."
        });
      }

      if (
        productId.length >
        MAX_PRODUCT_ID_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID."
        });
      }

      const product =
        await Product.findOneAndDelete({
          id: productId
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found."
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Product deleted successfully."
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete product."
      });
    }
  };