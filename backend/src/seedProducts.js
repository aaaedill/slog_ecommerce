import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {
    id: "1",
    name: "FIVE-SLEEVE BLACK T-SHIRT",
    price: 499,
    description: "Premium five-sleeve t-shirts for men",
    image: "/images/p1.png",
    category: "tshirt",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
      { size: "XXL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "2",
    name: "FIVE-SLEEVE LAVENDER T-SHIRT",
    price: 499,
    description: "Premium five-sleeve t-shirts for men",
    image: "/images/p2.png",
    category: "tshirt",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
      { size: "XXL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "3",
    name: "OVERSIZED HOODIE BLACK",
    price: 1299,
    description: "Premium oversized hoodie for men",
    image: "/images/p3.png",
    category: "hoodie",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
      { size: "XXL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "4",
    name: "OVERSIZED 77 T-SHIRT",
    price: 1199,
    description: "Premium five-sleeve 77 printed t-shirts for men",
    image: "/images/p4.png",
    category: "tshirt",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "5",
    name: "OVERSIZED HOODIE",
    price: 1299,
    description: "Premium oversized hoodie for men",
    image: "/images/p5.png",
    category: "hoodie",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "6",
    name: "IMP LINEN SHIRT",
    price: 1599,
    description: "Imported Linen Shirts",
    image: "/images/p6.png",
    category: "shirt",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "7",
    name: "HOTWHEELS FIVE-SLEEVE",
    price: 1399,
    description: "Premium printed t-shirt",
    image: "/images/p7.png",
    category: "tshirt",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "8",
    name: "DROPSHOULDER SHIRT",
    price: 1499,
    description: "Unisex dropshoulder shirts",
    image: "/images/p8.png",
    category: "shirt",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "9",
    name: "STRAIGHT-FIT JEANS",
    price: 1699,
    description: "Premium straight fit jeans",
    image: "/images/p9.png",
    category: "pants",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "10",
    name: "SLOG BOXY BAGGY",
    price: 1199,
    description: "Premium baggy pants",
    image: "/images/p10.png",
    category: "pants",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "11",
    name: "OVERSIZED TW-5 HOODIE",
    price: 1599,
    description: "Premium oversized hoodie",
    image: "/images/p11.png",
    category: "hoodie",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 }
    ],
    rating: 4.5
  },

  {
    id: "12",
    name: "OVERSIZED FLWR HOODIE",
    price: 1299,
    description: "Premium flower hoodie",
    image: "/images/p12.png",
    category: "hoodie",
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 }
    ],
    rating: 4.5
  }
];

const seedProducts = async () => {
  try {
    await connectDB();

    console.log("");
    console.log("Starting product import...");
    console.log(`Products prepared: ${products.length}`);

    await Product.deleteMany({});

    console.log("Existing products cleared.");

    await Product.insertMany(products);

    console.log("");
    console.log("==========================================");
    console.log("       PRODUCTS IMPORTED SUCCESSFULLY");
    console.log("==========================================");
    console.log(`Products imported: ${products.length}`);
    console.log("==========================================");
    console.log("");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("       PRODUCT IMPORT FAILED");
    console.error("==========================================");
    console.error(error);
    console.error("==========================================");
    console.error("");

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedProducts();