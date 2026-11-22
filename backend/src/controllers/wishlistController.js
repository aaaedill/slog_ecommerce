import mongoose from "mongoose";

import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

/*
|--------------------------------------------------------------------------
| WISHLIST CONFIGURATION
|--------------------------------------------------------------------------
*/

const MAX_PRODUCT_ID_LENGTH = 100;
const MAX_WISHLIST_ITEMS = 100;

/*
|--------------------------------------------------------------------------
| HELPER: GET AUTHENTICATED USER ID
|--------------------------------------------------------------------------
*/

const getAuthenticatedUserId = (req) => {
  return req.user?._id;
};

/*
|--------------------------------------------------------------------------
| HELPER: NORMALIZE PRODUCT ID
|--------------------------------------------------------------------------
*/

const normalizeProductId = (productId) => {
  if (
    productId === undefined ||
    productId === null
  ) {
    return "";
  }

  return String(productId).trim();
};

/*
|--------------------------------------------------------------------------
| HELPER: VALIDATE PRODUCT ID
|--------------------------------------------------------------------------
*/

const validateProductId = (productId) => {
  if (!productId) {
    return "Product ID is required.";
  }

  if (
    productId.length >
    MAX_PRODUCT_ID_LENGTH
  ) {
    return "Product ID is invalid.";
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| HELPER: FIND PRODUCT
|--------------------------------------------------------------------------
|
| Your Product model has a custom string field called "id" as well as
| MongoDB's built-in "_id".
|
| Support both identifiers so the wishlist works with the identifiers
| used by your existing product pages and APIs.
|
|--------------------------------------------------------------------------
*/

const findProductByIdentifier = async (
  productId
) => {
  const productByCustomId =
    await Product.findOne({
      id: productId
    });

  if (productByCustomId) {
    return productByCustomId;
  }

  if (
    mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    return Product.findById(
      productId
    );
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| HELPER: GET OR CREATE WISHLIST
|--------------------------------------------------------------------------
*/

const getOrCreateWishlist = async (
  userId
) => {
  let wishlist =
    await Wishlist.findOne({
      user: userId
    });

  if (wishlist) {
    return wishlist;
  }

  try {
    wishlist = await Wishlist.create({
      user: userId,
      products: []
    });

    return wishlist;
  } catch (error) {
    /*
     * Another simultaneous request may have created the wishlist.
     * If the unique user index rejects this insert, fetch that record.
     */

    if (error?.code === 11000) {
      const existingWishlist =
        await Wishlist.findOne({
          user: userId
        });

      if (existingWishlist) {
        return existingWishlist;
      }
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| HELPER: FORMAT WISHLIST RESPONSE
|--------------------------------------------------------------------------
|
| Populate the existing product documents so the frontend receives
| current product details rather than duplicated, outdated details.
|
|--------------------------------------------------------------------------
*/

const getPopulatedWishlist = async (
  userId
) => {
  const wishlist =
    await Wishlist.findOne({
      user: userId
    }).populate("products");

  if (!wishlist) {
    return [];
  }

  /*
   * A product may have been deleted after being saved.
   * Exclude missing products from the response.
   */

  const products =
    wishlist.products.filter(
      (product) => product !== null
    );

  /*
   * Clean up references to products that no longer exist.
   */

  if (
    products.length !==
    wishlist.products.length
  ) {
    wishlist.products =
      products.map(
        (product) => product._id
      );

    await wishlist.save();
  }

  return products;
};

/*
|--------------------------------------------------------------------------
| GET WISHLIST
|--------------------------------------------------------------------------
|
| GET /api/wishlist
|
| Returns the authenticated user's saved products.
|
|--------------------------------------------------------------------------
*/

export const getWishlist = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required."
      });
    }

    const products =
      await getPopulatedWishlist(
        userId
      );

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error(
      "Get wishlist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve your wishlist."
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADD PRODUCT TO WISHLIST
|--------------------------------------------------------------------------
|
| POST /api/wishlist/:productId
|
| A product may be saved even if it is currently out of stock.
| The frontend can show its availability and prevent an invalid
| add-to-cart operation later.
|
|--------------------------------------------------------------------------
*/

export const addToWishlist = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required."
      });
    }

    const productId =
      normalizeProductId(
        req.params.productId
      );

    const validationError =
      validateProductId(productId);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const product =
      await findProductByIdentifier(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found."
      });
    }

    const wishlist =
      await getOrCreateWishlist(
        userId
      );

    const alreadySaved =
      wishlist.products.some(
        (savedProductId) =>
          savedProductId.toString() ===
          product._id.toString()
      );

    if (alreadySaved) {
      const products =
        await getPopulatedWishlist(
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Product is already in your wishlist.",
        count: products.length,
        products
      });
    }

    if (
      wishlist.products.length >=
      MAX_WISHLIST_ITEMS
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Your wishlist can contain up to ${MAX_WISHLIST_ITEMS} products. Remove a product before adding another.`
      });
    }

    wishlist.products.addToSet(
      product._id
    );

    await wishlist.save();

    const products =
      await getPopulatedWishlist(
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Product added to your wishlist.",
      count: products.length,
      products
    });
  } catch (error) {
    console.error(
      "Add to wishlist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add this product to your wishlist."
    });
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE PRODUCT FROM WISHLIST
|--------------------------------------------------------------------------
|
| DELETE /api/wishlist/:productId
|
|--------------------------------------------------------------------------
*/

export const removeFromWishlist = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required."
      });
    }

    const productId =
      normalizeProductId(
        req.params.productId
      );

    const validationError =
      validateProductId(productId);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const product =
      await findProductByIdentifier(
        productId
      );

    /*
     * The product may have been deleted already.
     * In that case, still allow removal by a valid MongoDB ID.
     */

    let productMongoId =
      product?._id || null;

    if (
      !productMongoId &&
      mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      productMongoId =
        new mongoose.Types.ObjectId(
          productId
        );
    }

    if (!productMongoId) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found."
      });
    }

    const wishlist =
      await Wishlist.findOne({
        user: userId
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message:
          "Your wishlist is already empty.",
        count: 0,
        products: []
      });
    }

    wishlist.products =
      wishlist.products.filter(
        (savedProductId) =>
          savedProductId.toString() !==
          productMongoId.toString()
      );

    await wishlist.save();

    const products =
      await getPopulatedWishlist(
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Product removed from your wishlist.",
      count: products.length,
      products
    });
  } catch (error) {
    console.error(
      "Remove from wishlist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove this product from your wishlist."
    });
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR WISHLIST
|--------------------------------------------------------------------------
|
| DELETE /api/wishlist
|
|--------------------------------------------------------------------------
*/

export const clearWishlist = async (
  req,
  res
) => {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required."
      });
    }

    await Wishlist.findOneAndUpdate(
      {
        user: userId
      },
      {
        $set: {
          products: []
        }
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Your wishlist has been cleared.",
      count: 0,
      products: []
    });
  } catch (error) {
    console.error(
      "Clear wishlist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to clear your wishlist."
    });
  }
};