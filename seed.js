import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env.local");

// ── Randomized inventory helper ──────────────────────────────────────────────
const inv = (s, m, l, xl, xxl) => ({ S: s, M: m, L: l, XL: xl, XXL: xxl });
const fullStock   = () => inv(12, 18, 15, 8, 4);
const lowStock    = () => inv(0, 2, 4, 0, 1);
const soldOutXXL  = () => inv(8, 12, 10, 5, 0);

// ── Diverse Clothing Products (14 products) ──────────────────────────────────
const products = [
  // --- NIKE RUNNING TEES ---
  {
    name: "Nike Dri-FIT Running Tee",
    brand: "Nike",
    shortDescription: "Lightweight moisture-wicking tee built for speed, comfort, and athletic workouts.",
    category: "t-shirts",
    price: 2800,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    tags: ["nike", "running", "athletic", "dri-fit", "sports", "moisture-wicking", "tee", "shirt", "blue", "gym", "workout"],
    inventory: soldOutXXL(),
  },
  {
    name: "Nike Trail Running T-Shirt",
    brand: "Nike",
    shortDescription: "Durable outdoor running shirt featuring Nike Trail graphics and soft cotton blend.",
    category: "t-shirts",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
    tags: ["nike", "trail", "running", "athletic", "outdoor", "grey", "tee", "shirt", "sports", "gym"],
    inventory: fullStock(),
  },
  {
    name: "Adidas Ultralight Running Shorts",
    brand: "Adidas",
    shortDescription: "Extremely lightweight running shorts with moisture-absorbing AEROREADY technology.",
    category: "pants",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop",
    tags: ["adidas", "running", "shorts", "athletic", "sports", "aeroready", "black"],
    inventory: fullStock(),
  },
  {
    name: "Puma Run Favorite Velocity Tee",
    brand: "Puma",
    shortDescription: "Vented performance tee built for high mileage and hot days.",
    category: "t-shirts",
    price: 1800,
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
    tags: ["puma", "running", "tee", "shirt", "sports", "activewear", "workout", "red"],
    inventory: fullStock(),
  },
  {
    name: "Under Armour Launch Running Pants",
    brand: "Under Armour",
    shortDescription: "Fitted athletic joggers designed to keep you warm, focused, and moving fast.",
    category: "pants",
    price: 3800,
    imageUrl: "https://images.unsplash.com/photo-1517438984742-1262db08379e?q=80&w=800&auto=format&fit=crop",
    tags: ["under-armour", "running", "pants", "athletic", "sports", "joggers", "warmup"],
    inventory: fullStock(),
  },

  // --- LEVI'S 511 JEANS ---
  {
    name: "Levi's 511 Slim Fit Jeans",
    brand: "Levi's",
    shortDescription: "Classic slim jeans in stretch blue denim — versatile for everyday wear.",
    category: "pants",
    price: 5500,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop",
    tags: ["levis", "jeans", "denim", "511", "slim-fit", "blue", "casual", "classic", "everyday", "pants"],
    inventory: fullStock(),
  },
  {
    name: "Levi's 511 Black Stretch Jeans",
    brand: "Levi's",
    shortDescription: "Modern 511 slim-fit jeans in solid black stretch denim.",
    category: "pants",
    price: 5800,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop",
    tags: ["levis", "jeans", "denim", "511", "slim-fit", "black", "stretch", "casual", "everyday", "pants"],
    inventory: fullStock(),
  },

  // --- PUMA ACTIVEWEAR ---
  {
    name: "Puma Active Training Tee",
    brand: "Puma",
    shortDescription: "Slim-fit performance tee ideal for high-intensity gym sessions.",
    category: "t-shirts",
    price: 1900,
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
    tags: ["puma", "sports", "gym", "slim-fit", "athletic", "activewear", "training", "workout", "shirt", "red"],
    inventory: fullStock(),
  },
  {
    name: "Puma Performance Track Shorts",
    brand: "Puma",
    shortDescription: "Breathable athletic shorts with dryCELL technology for ultimate comfort.",
    category: "pants",
    price: 2200,
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop",
    tags: ["puma", "shorts", "gym", "activewear", "athletic", "sports", "drycell", "black", "workout"],
    inventory: lowStock(),
  },

  // --- COLORS / PATTERNS ---
  {
    name: "Zara All Black Evening Dress",
    brand: "Zara",
    shortDescription: "Elegant formal evening dress in clean solid black — perfect for dinners.",
    category: "dresses",
    price: 7500,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    tags: ["black", "dress", "evening", "formal", "elegant", "party", "dinner", "all-black", "zara"],
    inventory: fullStock(),
  },
  {
    name: "H&M Floral Summer Hawaiian Shirt",
    brand: "H&M",
    shortDescription: "Breathable short-sleeve resort shirt with a vibrant floral pattern.",
    category: "shirts",
    price: 2400,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
    tags: ["floral", "summer", "shirt", "hawaiian", "pattern", "resort", "casual", "colorful", "h&m"],
    inventory: fullStock(),
  },
  {
    name: "Uniqlo Plain White Crewneck Tee",
    brand: "Uniqlo",
    shortDescription: "Buttery-soft minimalist white tee in a clean crewneck silhouette.",
    category: "t-shirts",
    price: 1500,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    tags: ["white", "plain", "tee", "basic", "minimalist", "cotton", "everyday", "casual", "uniqlo"],
    inventory: fullStock(),
  },

  // --- SEASONS / OCCASIONS ---
  {
    name: "Zara Winter Leather Biker Jacket",
    brand: "Zara",
    shortDescription: "Heavyweight black leather biker jacket with silver zippers for cold weather.",
    category: "outerwear",
    price: 12500,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
    tags: ["winter", "leather", "jacket", "biker", "black", "outerwear", "warm", "cold", "zara", "premium"],
    inventory: fullStock(),
  },
  {
    name: "Zara Party Wear Velvet Blazer",
    brand: "Zara",
    shortDescription: "Luxurious deep black velvet blazer for upscale parties and formal events.",
    category: "outerwear",
    price: 11000,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    tags: ["party", "blazer", "velvet", "formal", "dinner", "suit", "jacket", "elegant", "black", "zara"],
    inventory: fullStock(),
  },
  {
    name: "Puma Gym Athletic Track Pants",
    brand: "Puma",
    shortDescription: "Tapered activewear joggers with secure side zip pockets.",
    category: "pants",
    price: 3500,
    imageUrl: "https://images.unsplash.com/photo-1517438984742-1262db08379e?q=80&w=800&auto=format&fit=crop",
    tags: ["gym", "track", "pants", "joggers", "puma", "activewear", "athletic", "sports", "tapered", "casual"],
    inventory: lowStock(),
  },

  // --- OTHER CLOTHING FOR RICH DIVERSITY ---
  {
    name: "H&M Winter Wool Trench Coat",
    brand: "H&M",
    shortDescription: "Elegant camel-colored wool trench coat for sophisticated winter layers.",
    category: "outerwear",
    price: 8500,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
    tags: ["winter", "wool", "trench", "coat", "outerwear", "camel", "beige", "warm", "long-coat", "h&m"],
    inventory: fullStock(),
  },
  {
    name: "Levi's Denim Trucker Jacket",
    brand: "Levi's",
    shortDescription: "The original denim jacket since 1967. A perfect transitional layer.",
    category: "outerwear",
    price: 6800,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop",
    tags: ["levis", "denim", "jacket", "trucker", "blue", "outerwear", "casual", "classic"],
    inventory: fullStock(),
  }
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

    console.log(`📦 Inserting ${products.length} clothing products...`);
    const result = await Product.insertMany(products);
    console.log(`✅ Successfully inserted ${result.length} products!\n`);

    console.log("📋 Catalog Summary:");
    result.forEach((p, i) => {
      const stockStatus = Object.values(p.inventory).every(v => v === 0) ? "🔴 OUT OF STOCK" : "🟢";
      console.log(`  ${i + 1}. ${stockStatus} [${p.category}] ${p.name} (${p.brand}) — ৳${p.price.toLocaleString("en-BD")}`);
      console.log(`      Tags: ${p.tags.join(", ")}`);
    });
    console.log("\n✨ Database seeded successfully with clothing items!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

seedDatabase();
