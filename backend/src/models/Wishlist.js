import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| WISHLIST SCHEMA
|--------------------------------------------------------------------------
|
| Each wishlist belongs to one authenticated user.
|
| Products are stored as references to the existing Product documents.
| This avoids duplicating product names, prices, images, and stock.
|
|--------------------------------------------------------------------------
*/

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

/*
|--------------------------------------------------------------------------
| WISHLIST MODEL
|--------------------------------------------------------------------------
*/

const Wishlist = mongoose.model(
  "Wishlist",
  wishlistSchema
);

export default Wishlist;