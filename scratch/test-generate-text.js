import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { tool } from "ai";
import mongoose from "mongoose";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const systemPrompt =
    "You are an elite luxury fashion stylist for TechDojo Store. BE EXTREMELY CONCISE. Do not act like a generic chatty AI. Do not use filler phrases like 'I would be happy to help'. Answer directly and elegantly.\n\nRULES:\n1. CLOTHING SEARCH: If the user asks for clothes, ALWAYS use the 'showProducts' tool. You MUST pass their entire request (including colors, brands, and categories) into the SINGLE 'query' parameter. DO NOT invent parameters like 'color' or 'category'.\n2. ADD TO CART: To add an item to the cart, you MUST have the exact product 'id' from a previous 'showProducts' result. If you do not have the 'id', use 'showProducts' first to find it. Never pass placeholder IDs to 'addToCart'.\n3. CART/ORDERS: If they ask about their cart or orders, use the 'viewCart' tool.\n4. NON-SHOPPING: If they say hi or talk about life, reply elegantly in 1-2 short sentences without calling tools.";

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
    description: "Add a specific product in a specific size to the user's shopping cart. IMPORTANT: You MUST have the exact 24-character hexadecimal MongoDB ObjectId 'productId' from a previous showProducts search. If you do not have it, you MUST call 'showProducts' first and wait for the search results. NEVER call 'addToCart' with placeholder IDs or guess the ID.",
    inputSchema: z.object({
      productId: z.string().describe("The MongoDB _id of the product to add"),
      size: z.enum(["S", "M", "L", "XL", "XXL"]).describe("The clothing size"),
      quantity: z.number().int().min(1).default(1).describe("Quantity to add")
    }),
    execute: async ({ productId, size }) => {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log("VALIDATION FAILED: Invalid productId:", productId);
        return { success: false, message: "Invalid product ID." };
      }
      console.log(`EXECUTE addToCart: ${productId} (Size: ${size})`);
      return { success: true, message: `Added to cart.` };
    }
  });

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: "Add Nike Dri-FIT tee in size M to my cart" }],
      tools: {
        showProducts,
        addToCart
      },
      maxSteps: 3,
    });

    console.log("STEPS RUN:", result.steps.length);
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      console.log(`\n--- Step ${i + 1} ---`);
      console.log("Text:", step.text);
      console.log("Tool Calls:", JSON.stringify(step.toolCalls, null, 2));
    }
    console.log("\nFINAL TEXT:", result.text);
  } catch (err) {
    console.error("FAILED:", err.message, err);
  }
}

main().catch(console.error);
