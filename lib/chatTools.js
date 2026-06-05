import { tool } from "ai";
import { z } from "zod";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import StockRequest from "@/models/StockRequest";
import User from "@/models/User";

// ─── Helper: generate order number ──────────────────────────────────────────
async function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Order.countDocuments();
  const seq = String(count + 1).padStart(4, "0");
  return `TDJ-${dateStr}-${seq}`;
}

export const browseProducts = tool({
  description:
    "Search the product catalog for SPECIFIC items. Call ONLY when the user has named a specific product type, category, brand, color, or use-case (e.g. 'nike running tees', 'black jeans', 'gym shorts'). DO NOT call this for greetings, vague requests like 'show me clothes', or general shopping intent. If the user is vague, respond conversationally and ask what they are looking for instead.",
  inputSchema: z.object({
    query: z.string().optional().describe("The specific search term — must be a product type, brand, or attribute. Examples: 'nike running tee', 'black jeans', 'gym shorts'. Never pass vague phrases like 'clothes' or 'something nice'."),
    category: z.string().optional().describe("Fallback category parameter"),
    search: z.string().optional().describe("Fallback search parameter")
  }),
  execute: async ({ query, category, search }) => {
    await dbConnect();
    console.log("🎯 AI is searching with parameters - query:", query, "category:", category, "search:", search);

    const searchQuery = (query || category || search || '').trim();
    console.log("🎯 Resolved search query:", searchQuery);
    
    let products = [];
    try {
      if (searchQuery) {
        // Tokenize search query and filter out common e-commerce search filler/stop words
        const stopWords = new Set([
          "product", "products", "clothing", "clothes", "item", "items", 
          "apparel", "show", "find", "buy", "shop", "wear", "me", "us", "get",
          "for", "in", "of", "with", "a", "an", "the", "and", "or", "to", "at", "from", "by", "about",
          "men", "mens", "man", "women", "womens", "woman", "boy", "boys", "girl", "girls", 
          "unisex", "male", "female", "lady", "ladies", "guy", "guys"
        ]);
        
        const keywords = searchQuery
          .toLowerCase()
          .split(/\s+/)
          .map(w => w.replace(/[^a-z0-9]/g, '')) // remove punctuation
          .filter(w => w && !stopWords.has(w));

        if (keywords.length > 0) {
          const conditions = keywords.map(word => {
            // Build singular/plural-resilient regex pattern
            let pattern = word;
            if (word.endsWith('s') && word.length > 3) {
              const singular = word.slice(0, -1);
              pattern = `${singular}s?`;
            } else {
              pattern = `${word}s?`;
            }
            const regex = new RegExp(pattern, 'i');
            return {
              $or: [
                { name: { $regex: regex } },
                { brand: { $regex: regex } },
                { category: { $regex: regex } },
                { tags: { $regex: regex } }
              ]
            };
          });

          products = await Product.find({ $and: conditions }).limit(5).lean();
        }
      }
      
      console.log(`📦 Database found ${products.length} products for "${searchQuery}"`);
      if (products.length === 0) return [];
    } catch (error) {
      console.error("Error searching products in database:", error);
      return [];
    }

    return {
      found: true,
      products: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        imageUrl: p.imageUrl,
        shortDescription: p.shortDescription,
        tags: p.tags,
        inventory: p.inventory,
      })),
    };
  },
});

// ─── Tool 2: Add to Cart ─────────────────────────────────────────────────────
export const addToCart = tool({
  description:
    "Add a product by its ID and size to the cart. If you do not have the ID, search for the product first.",
  inputSchema: z.object({
    productId: z.string().describe("The MongoDB _id of the product to add"),
    size: z.enum(["S", "M", "L", "XL", "XXL"]).describe("The clothing size"),
    quantity: z
      .number()
      .int()
      .min(1)
      .default(1)
      .describe("Quantity to add (default 1)"),
  }),
  execute: async ({ productId, size, quantity = 1, userId }) => {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return {
        success: false,
        reason: "invalid_product_id",
        message: `Invalid product ID: ${productId}. Please search for the product first using showProducts to get the correct product ID.`,
      };
    }

    const product = await Product.findById(productId).lean();
    if (!product)
      return {
        success: false,
        reason: "product_not_found",
        message: "Product not found.",
      };

    // — Stock check ─────────────────────────────────────────────────────────
    const stockQty = product.inventory?.[size] ?? 0;
    if (stockQty < quantity) {
      // Auto-create StockRequest on behalf of the user
      const user = await User.findById(userId).lean();
      await StockRequest.create({
        userId,
        productId,
        productName: product.name,
        size,
        notifyEmail: user?.email,
        initiatedBy: "chatbot",
      });
      return {
        success: false,
        reason: "out_of_stock",
        productName: product.name,
        size,
        message: `${product.name} in size ${size} is currently out of stock. A restock request has been automatically submitted on your behalf — we'll notify you at ${user?.email || "your email"} when it's available.`,
      };
    }

    // — Add to cart ─────────────────────────────────────────────────────────
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, size, quantity }] });
    } else {
      const existing = cart.items.find(
        (item) => item.productId.toString() === productId && item.size === size,
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId, size, quantity });
      }
    }
    await cart.save();

    // Re-fetch populated cart to return updated state
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId").lean();
    const updatedItems = (updatedCart?.items || []).map((i) => ({
      itemId: i._id.toString(),
      name: i.productId?.name || "Unknown",
      brand: i.productId?.brand || "",
      imageUrl: i.productId?.imageUrl || "",
      price: i.productId?.price || 0,
      size: i.size,
      quantity: i.quantity,
      lineTotal: (i.productId?.price || 0) * i.quantity,
    }));
    const updatedTotal = updatedItems.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      success: true,
      productName: product.name,
      size,
      quantity,
      price: product.price,
      cart: { items: updatedItems, total: updatedTotal, isEmpty: false },
      message: `Added ${quantity}× ${product.name} (Size ${size}) to your cart for ৳${(product.price * quantity).toLocaleString("en-BD")}.`,
    };
  },
});

// ─── Tool 3: Remove from Cart ────────────────────────────────────────────────
export const removeFromCart = tool({
  description:
    "Remove an item from the cart by its name and size.",
  inputSchema: z.object({
    productName: z
      .string()
      .describe("The name of the product to remove (partial match ok)"),
    size: z
      .enum(["S", "M", "L", "XL", "XXL"])
      .describe("The size of the item to remove"),
  }),
  execute: async ({ productName, size, userId }) => {
    await dbConnect();

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    // Fuzzy match: find the item whose product name contains the query (case-insensitive)
    const item = cart.items.find((i) => {
      const name = i.productId?.name || "";
      return (
        name.toLowerCase().includes(productName.toLowerCase()) &&
        i.size === size
      );
    });

    if (!item) {
      return {
        success: false,
        message: `Could not find "${productName}" in size ${size} in your cart. Please check what's in your bag first.`,
      };
    }

    const removedName = item.productId?.name || productName;
    cart.items.pull(item._id);
    await cart.save();

    // Re-fetch populated cart to return updated state
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId").lean();
    const updatedItems = (updatedCart?.items || []).map((i) => ({
      itemId: i._id.toString(),
      name: i.productId?.name || "Unknown",
      brand: i.productId?.brand || "",
      imageUrl: i.productId?.imageUrl || "",
      price: i.productId?.price || 0,
      size: i.size,
      quantity: i.quantity,
      lineTotal: (i.productId?.price || 0) * i.quantity,
    }));
    const updatedTotal = updatedItems.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      success: true,
      removedName,
      size,
      cart: { items: updatedItems, total: updatedTotal, isEmpty: updatedItems.length === 0 },
      message: updatedItems.length === 0
        ? `Removed ${removedName} (Size ${size}) from your cart. Your cart is now empty.`
        : `Removed ${removedName} (Size ${size}) from your cart.`,
    };
  },
});

// ─── Tool 4: View Cart ───────────────────────────────────────────────────────
export const viewCart = tool({
  description:
    "View the contents of the cart.",
  inputSchema: z.any(),
  execute: async ({ userId }) => {
    await dbConnect();

    const cart = await Cart.findOne({ userId })
      .populate("items.productId")
      .lean();
    if (!cart || cart.items.length === 0) {
      return {
        isEmpty: true,
        items: [],
        total: 0,
        message: "Your cart is empty.",
      };
    }

    const items = cart.items.map((item) => ({
      itemId: item._id.toString(),
      productId: item.productId?._id?.toString(),
      name: item.productId?.name || "Unknown",
      brand: item.productId?.brand || "",
      imageUrl: item.productId?.imageUrl || "",
      price: item.productId?.price || 0,
      size: item.size,
      quantity: item.quantity,
      lineTotal: (item.productId?.price || 0) * item.quantity,
    }));

    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      isEmpty: false,
      items,
      total,
      itemCount: items.length,
      message: `You have ${items.length} item${items.length !== 1 ? "s" : ""} in your cart totalling ৳${total.toLocaleString("en-BD")}.`,
    };
  },
});

// ─── Tool 5: Checkout ────────────────────────────────────────────────────────
export const checkout = tool({
  description:
    "Place the order and complete checkout.",
  inputSchema: z.any(),
  execute: async ({ userId }) => {
    await dbConnect();

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty. Add some items before placing an order.",
      };
    }

    // — Build item snapshots ─────────────────────────────────────────────────
    const orderItems = cart.items.map((item) => {
      const p = item.productId;
      return {
        productId: p._id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        size: item.size,
        quantity: item.quantity,
        lineTotal: p.price * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    const shipping = 60;
    const total = subtotal + shipping;

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId,
      items: orderItems,
      pricing: { subtotal, shipping, total },
      status: "confirmed",
      placedVia: "chatbot",
    });

    // — Clear cart ───────────────────────────────────────────────────────────
    await Cart.deleteOne({ userId });

    return {
      success: true,
      orderNumber: order.orderNumber,
      items: orderItems,
      subtotal,
      shipping,
      total,
      message: `Order confirmed! Your order #${orderNumber} has been placed successfully. Total: ৳${total.toLocaleString("en-BD")} (including ৳60 delivery). We'll have it shipped to you shortly! 🎉`,
    };
  },
});
