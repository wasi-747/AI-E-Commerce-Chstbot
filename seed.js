import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

const generateRandomInventory = () => ({
  S: Math.floor(Math.random() * 30),
  M: Math.floor(Math.random() * 50),
  L: Math.floor(Math.random() * 40),
  XL: Math.floor(Math.random() * 20),
  XXL: Math.floor(Math.random() * 10),
});

const minimalistBasics = [
  {
    name: "Optic White Supima Tee",
    category: "Minimalist Basics",
    price: 3500,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Onyx Heavyweight Crew",
    category: "Minimalist Basics",
    price: 3800,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Taupe Linen Button-Down",
    category: "Minimalist Basics",
    price: 5200,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Ivory Silk Blend Camisole",
    category: "Minimalist Basics",
    price: 4500,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Charcoal Relaxed Fit Trousers",
    category: "Minimalist Basics",
    price: 7800,
    imageUrl: "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?q=80&w=800&auto=format&fit=crop",
  },
];

const winterOuterwear = [
  {
    name: "Cashmere Double-Breasted Coat",
    category: "Winter Outerwear",
    price: 24500,
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Alpine Wool Overcoat",
    category: "Winter Outerwear",
    price: 18900,
    imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Midnight Quilted Down Jacket",
    category: "Winter Outerwear",
    price: 15600,
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Camel Tailored Trench",
    category: "Winter Outerwear",
    price: 21000,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Graphite Fleece Half-Zip",
    category: "Winter Outerwear",
    price: 8500,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
  },
];

const premiumAccessories = [
  {
    name: "Pebbled Leather Weekender Bag",
    category: "Premium Accessories",
    price: 32000,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Cognac Crossbody Tote",
    category: "Premium Accessories",
    price: 14500,
    imageUrl: "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Matte Black Chronograph Watch",
    category: "Premium Accessories",
    price: 45000,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Gold Mesh Classic Timepiece",
    category: "Premium Accessories",
    price: 38000,
    imageUrl: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Acetate Tortoiseshell Sunglasses",
    category: "Premium Accessories",
    price: 9800,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Woven Silk Necktie",
    category: "Premium Accessories",
    price: 4200,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
  },
];

const seedDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");

    console.log("🗑️ Clearing existing dummy products...");
    await Product.deleteMany({});
    console.log("✅ Cleared existing products!");

    const allProducts = [
      ...minimalistBasics,
      ...winterOuterwear,
      ...premiumAccessories,
    ];

    const productsWithInventory = allProducts.map((product) => ({
      ...product,
      inventory: generateRandomInventory(),
    }));

    console.log(`📦 Inserting ${productsWithInventory.length} highly realistic premium items...`);
    const result = await Product.insertMany(productsWithInventory);
    console.log(`✅ Successfully inserted ${result.length} luxury products!`);

    console.log("\n📋 New Luxury Catalog:");
    result.forEach((product, index) => {
      console.log(
        `  ${index + 1}. [${product.category}] ${product.name} - ৳${product.price.toLocaleString("en-BD")}`
      );
    });

    console.log("\n✨ Catalog revamp completed successfully!");
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
