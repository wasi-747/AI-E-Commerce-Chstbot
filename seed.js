import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

const generateRandomInventory = () => ({
  S: Math.floor(Math.random() * 51),
  M: Math.floor(Math.random() * 51),
  L: Math.floor(Math.random() * 51),
  XL: Math.floor(Math.random() * 51),
  XXL: Math.floor(Math.random() * 51),
});

const tshirtProducts = [
  {
    name: "Classic Cotton T-Shirt",
    category: "t-shirts",
    price: 19.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
  },
  {
    name: "Vintage Graphic Tee",
    category: "t-shirts",
    price: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1554521722-7469531586cf?w=500&h=500&fit=crop",
  },
  {
    name: "Premium Crew Neck T-Shirt",
    category: "t-shirts",
    price: 29.99,
    imageUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
  },
  {
    name: "Striped Cotton Tee",
    category: "t-shirts",
    price: 22.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
  },
  {
    name: "Casual Unisex T-Shirt",
    category: "t-shirts",
    price: 17.99,
    imageUrl:
      "https://images.unsplash.com/photo-1618760987742-f049cd451bba?w=500&h=500&fit=crop",
  },
];

const pantsProducts = [
  {
    name: "Classic Blue Jeans",
    category: "pants",
    price: 54.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop",
  },
  {
    name: "Slim Fit Chinos",
    category: "pants",
    price: 49.99,
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop",
  },
  {
    name: "Relaxed Denim Pants",
    category: "pants",
    price: 59.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop",
  },
  {
    name: "Black Tapered Pants",
    category: "pants",
    price: 44.99,
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop",
  },
  {
    name: "Navy Cargo Pants",
    category: "pants",
    price: 64.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop",
  },
];

const seedDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");

    console.log("🗑️  Clearing existing products from the database...");
    await Product.deleteMany({});
    console.log("✅ Cleared existing products!");

    const allProducts = [...tshirtProducts, ...pantsProducts];

    const productsWithInventory = allProducts.map((product) => ({
      ...product,
      inventory: generateRandomInventory(),
    }));

    console.log("📦 Inserting 10 new products...");
    const result = await Product.insertMany(productsWithInventory);
    console.log(`✅ Successfully inserted ${result.length} products!`);

    console.log("\n📋 Seeded Products:");
    result.forEach((product, index) => {
      console.log(
        `  ${index + 1}. ${product.name} (${product.category}) - $${product.price}`,
      );
      console.log(
        `     Inventory - S: ${product.inventory.S}, M: ${product.inventory.M}, L: ${product.inventory.L}, XL: ${product.inventory.XL}, XXL: ${product.inventory.XXL}`,
      );
    });

    console.log("\n✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    console.log("🔌 Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB!");
  }
};

seedDatabase();
