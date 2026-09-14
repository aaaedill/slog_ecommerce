import dotenv from "dotenv";

import connectDB from "./config/db.js";

import Product from "./models/Product.js";


dotenv.config();


const migrateProductSizes = async () => {

  try {

    console.log(
      "\nStarting product size migration...\n"
    );


    const connected =
      await connectDB();


    if (!connected) {

      throw new Error(
        "MongoDB connection failed."
      );

    }


    /*
     * Convert old string sizes:
     *
     * ["S", "M", "L"]
     *
     * into:
     *
     * [
     *   { size: "S", stock: 0 },
     *   { size: "M", stock: 0 },
     *   { size: "L", stock: 0 }
     * ]
     *
     * Products that already contain
     * object-based sizes are left alone.
     */


    const result =
      await Product.collection.updateMany(

        {
          sizes: {
            $elemMatch: {
              $type: "string"
            }
          }
        },

        [
          {
            $set: {

              sizes: {

                $map: {

                  input:
                    "$sizes",

                  as:
                    "item",

                  in: {

                    $cond: [

                      {
                        $eq: [
                          {
                            $type:
                              "$$item"
                          },
                          "string"
                        ]
                      },

                      {
                        size:
                          "$$item",

                        stock:
                          0
                      },

                      "$$item"

                    ]

                  }

                }

              }

            }

          }

        ]

      );


    console.log(
      "Migration completed successfully.\n"
    );


    console.log(
      `Matched products: ${result.matchedCount}`
    );


    console.log(
      `Modified products: ${result.modifiedCount}`
    );


    console.log(
      "\nExisting string sizes have been converted."
    );


    console.log(
      "Old sizes were assigned stock: 0"
    );


    console.log(
      "\nYou can now edit each product and enter its actual stock.\n"
    );


    await connectDB.disconnect();


    process.exit(
      0
    );


  } catch (error) {

    console.error(
      "\nPRODUCT SIZE MIGRATION FAILED:"
    );


    console.error(
      error
    );


    try {

      await connectDB.disconnect();

    } catch {

      // Ignore disconnect errors.

    }


    process.exit(
      1
    );

  }

};


migrateProductSizes();