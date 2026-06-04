import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { tool } from "ai";
import mongoose from "mongoose";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const systemPrompt =
    "You are an elite luxury fashion stylist for TechDojo Store. BE EXTREMELY CONCISE. Do not act like a generic chatty AI. Answer directly.\n\nRULES:\n1. CLOTHING SEARCH: If the user asks for clothes, ALWAYS use the 'showProducts' tool. You MUST pass their entire request into the SINGLE 'query' parameter.\n2. CART/ORDERS: If they ask about their cart or orders, use the 'viewCart' tool.\n3. ADD TO CART: To add an item to the cart, you MUST have the exact product 'id' from a previous 'showProducts' result. If you do not have the 'id', use 'showProducts' first to find it. Never pass placeholder IDs to 'addToCart'.";

  const showProducts = tool({
    description: "Search and filter the product catalog. Returns up to 5 matching products.",
    inputSchema: z.object({
      query: z.string()
    }),
    execute: async ({ query }) => {
      console.log("EXECUTE showProducts:", query);
      return {
        found: true,
        products: [
          { id: "6a20e409fbc55ad06bc650a5", name: "Nike Dri-FIT Running Tee" }
        ]
      };
    }
  });

  const addToCart = tool({
    description: "Add a specific product in a specific size to the user's shopping cart.",
    inputSchema: z.object({
      productId: z.string().describe("The MongoDB _id of the product to add"),
      size: z.enum(["S", "M", "L", "XL", "XXL"]).describe("The clothing size"),
      quantity: z.number().int().min(1).default(1).describe("Quantity to add")
    }),
    execute: async ({ productId }) => {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log("VALIDATION FAILED: Invalid productId:", productId);
        return { success: false, message: "Invalid product ID." };
      }
      console.log("EXECUTE addToCart:", productId);
      return { success: true };
    }
  });

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: [{ role: "user", content: "Add Nike Dri-FIT tee in size M to my cart" }],
    tools: {
      showProducts,
      addToCart
    },
    maxSteps: 3,
  });

  for await (const chunk of result.fullStream) {
    console.log("CHUNK:", JSON.stringify(chunk, null, 2));
  }
}

main().catch(console.error);
