import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env.local");

// ── Randomized inventory helper ──────────────────────────────────────────────
const inv = (s, m, l, xl, xxl) => ({ S: s, M: m, L: l, XL: xl, XXL: xxl });
const fullStock  = () => inv(15, 25, 20, 12, 8);
const lowStock   = () => inv(0, 3, 5, 0, 2);   // Edge case: S and XL sold out
const soldOutXXL = () => inv(10, 18, 14, 6, 0); // Edge case: XXL sold out

// ── T-Shirts (8 products) ────────────────────────────────────────────────────
const tshirts = [
  {
    name: "Nike Dri-FIT Running Tee",
    brand: "Nike",
    shortDescription: "Lightweight moisture-wicking tee built for speed and comfort.",
    category: "t-shirts",
    price: 2800,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    tags: ["running", "nike", "athletic", "dri-fit", "sports", "moisture-wicking"],
    inventory: soldOutXXL(),
  },
  {
    name: "Nike Air Graphic Tee",
    brand: "Nike",
    shortDescription: "Bold Air graphic print on premium cotton for everyday street style.",
    category: "t-shirts",
    price: 2400,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
    tags: ["nike", "graphic", "cotton", "casual", "streetwear"],
    inventory: fullStock(),
  },
  {
    name: "Adidas Essentials 3-Stripes Tee",
    brand: "Adidas",
    shortDescription: "Classic 3-stripe tee in soft cotton — a wardrobe essential.",
    category: "t-shirts",
    price: 2200,
    imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop",
    tags: ["adidas", "essentials", "cotton", "classic", "casual", "everyday"],
    inventory: fullStock(),
  },
  {
    name: "Adidas AEROREADY Training Tee",
    brand: "Adidas",
    shortDescription: "High-performance training tee with AEROREADY moisture management.",
    category: "t-shirts",
    price: 2600,
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
    tags: ["adidas", "training", "aeroready", "athletic", "sports", "gym", "running"],
    inventory: lowStock(), // S and XL are 0 — triggers REQUEST_STOCK
  },
  {
    name: "Puma Active Sports Tee",
    brand: "Puma",
    shortDescription: "Slim-fit performance tee ideal for gym and active lifestyle.",
    category: "t-shirts",
    price: 1900,
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
    tags: ["puma", "sports", "gym", "slim-fit", "athletic", "active"],
    inventory: fullStock(),
  },
  {
    name: "Uniqlo Supima Cotton Crew Tee",
    brand: "Uniqlo",
    shortDescription: "Buttery-soft Supima cotton tee in a relaxed, timeless silhouette.",
    category: "t-shirts",
    price: 1500,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    tags: ["uniqlo", "supima", "cotton", "casual", "minimalist", "basic", "everyday"],
    inventory: fullStock(),
  },
  {
    name: "H&M Oversized Printed Tee",
    brand: "H&M",
    shortDescription: "Trendy oversized fit with a bold print — great for casual weekends.",
    category: "t-shirts",
    price: 1200,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
    tags: ["h&m", "oversized", "printed", "casual", "streetwear", "trendy", "summer"],
    inventory: soldOutXXL(),
  },
  {
    name: "Zara Linen Blend V-Neck Tee",
    brand: "Zara",
    shortDescription: "Breathable linen-blend V-neck — effortless summer sophistication.",
    category: "t-shirts",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop",
    tags: ["zara", "linen", "v-neck", "summer", "premium", "casual", "breathable"],
    inventory: fullStock(),
  },
];

// ── Pants (7 products) ───────────────────────────────────────────────────────
const pants = [
  {
    name: "Levi's 511 Slim Fit Jeans",
    brand: "Levi's",
    shortDescription: "Iconic slim jeans in stretch denim — versatile from day to night.",
    category: "pants",
    price: 5500,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop",
    tags: ["levis", "jeans", "denim", "slim-fit", "casual", "classic", "everyday"],
    inventory: fullStock(),
  },
  {
    name: "Nike Running Jogger Pants",
    brand: "Nike",
    shortDescription: "Tapered running joggers with DWR coating and side pockets.",
    category: "pants",
    price: 4200,
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961a28f?q=80&w=800&auto=format&fit=crop",
    tags: ["nike", "joggers", "running", "athletic", "sports", "tapered", "training"],
    inventory: soldOutXXL(),
  },
  {
    name: "Adidas Tiro Track Pants",
    brand: "Adidas",
    shortDescription: "Football-inspired Tiro pants with 2-color design and side stripes.",
    category: "pants",
    price: 3800,
    imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=800&auto=format&fit=crop",
    tags: ["adidas", "track", "tiro", "athletic", "sports", "football", "casual"],
    inventory: fullStock(),
  },
  {
    name: "Puma Essential Fleece Sweatpants",
    brand: "Puma",
    shortDescription: "Cozy fleece sweatpants with an elastic waistband for ultimate comfort.",
    category: "pants",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
    tags: ["puma", "fleece", "sweatpants", "comfort", "casual", "cozy", "lounge"],
    inventory: lowStock(), // Edge case: low stock, S and XL = 0
  },
  {
    name: "Uniqlo Ultra Stretch Skinny Chinos",
    brand: "Uniqlo",
    shortDescription: "Smart stretch chinos that move with you — office to weekend ready.",
    category: "pants",
    price: 3500,
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop",
    tags: ["uniqlo", "chinos", "skinny", "stretch", "smart", "office", "minimalist"],
    inventory: fullStock(),
  },
  {
    name: "H&M Relaxed Cargo Pants",
    brand: "H&M",
    shortDescription: "Street-ready cargo pants with functional pockets and relaxed fit.",
    category: "pants",
    price: 2800,
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
    tags: ["h&m", "cargo", "relaxed", "streetwear", "casual", "utility", "trendy"],
    inventory: fullStock(),
  },
  {
    name: "Zara Premium Tailored Trousers",
    brand: "Zara",
    shortDescription: "Polished tailored trousers in a modern slim silhouette.",
    category: "pants",
    price: 6500,
    imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop",
    tags: ["zara", "tailored", "trousers", "premium", "formal", "slim", "office"],
    inventory: fullStock(),
  },
];

// ── Seed Function ────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB!");

    console.log("🗑️  Clearing existing products...");
    await Product.deleteMany({});
    console.log("✅ Cleared existing products!");

    const allProducts = [...tshirts, ...pants];
    console.log(`📦 Inserting ${allProducts.length} products...`);
    const result = await Product.insertMany(allProducts);
    console.log(`✅ Successfully inserted ${result.length} products!\n`);

    console.log("📋 Catalog Summary:");
    result.forEach((p, i) => {
      const stockStatus = Object.values(p.inventory).every(v => v === 0) ? "🔴 OUT OF STOCK" : "🟢";
      console.log(`  ${i + 1}. ${stockStatus} [${p.category}] ${p.name} (${p.brand}) — ৳${p.price.toLocaleString("en-BD")}`);
      console.log(`      Tags: ${p.tags.join(", ")}`);
    });
    console.log("\n✨ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

seedDatabase();
