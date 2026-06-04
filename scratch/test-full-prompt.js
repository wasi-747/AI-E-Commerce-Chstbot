import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import { buildCatalogSummary, buildCartSummary, SYSTEM_PROMPT_TEMPLATE } from "../lib/systemPrompt.js";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Fetch data
  const products = await Product.find({}).lean();
  const catalogSummary = buildCatalogSummary(products);

  // Use a dummy user / cart for testing
  const catalogText = catalogSummary;
  const cartText = "Cart is empty.";
  const userName = "Test User";

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{USER_NAME}", userName)
    .replace("{CATALOG}", catalogText)
    .replace("{CART}", cartText)
    .replace(/browseProducts/g, "showProducts"); // map browseProducts to showProducts

  console.log("System Prompt preview:\n", systemPrompt.slice(0, 400) + "...\n");

  const runIntent = async (msg) => {
    console.log(`\nUser: "${msg}"`);
    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      messages: [{ role: "user", content: msg }],
      tools: {
        showProducts: tool({
          description: "Search and filter the product catalog.",
          inputSchema: z.object({ query: z.string() }),
          execute: async ({ query }) => {
            console.log("   -> TOOL CALL: showProducts with query:", query);
            return { found: true, products: products.slice(0, 2) };
          }
        }),
        addToCart: tool({
          description: "Add a specific product + size to the cart. ALWAYS call this tool.",
          inputSchema: z.object({
            productId: z.string().describe("The MongoDB _id of the product"),
            size: z.enum(["S", "M", "L", "XL", "XXL"]),
            quantity: z.number().default(1)
          }),
          execute: async (args) => {
            console.log("   -> TOOL CALL: addToCart with args:", args);
            return { success: true, message: "Added!" };
          }
        }),
        removeFromCart: tool({
          description: "Remove an item from the cart by name and size.",
          inputSchema: z.object({
            productName: z.string(),
            size: z.enum(["S", "M", "L", "XL", "XXL"])
          }),
          execute: async (args) => {
            console.log("   -> TOOL CALL: removeFromCart with args:", args);
            return { success: true, message: "Removed!" };
          }
        }),
        viewCart: tool({
          description: "View the contents of the cart.",
          inputSchema: z.any(),
          execute: async () => {
            console.log("   -> TOOL CALL: viewCart");
            return { isEmpty: false, items: [], total: 0 };
          }
        }),
        checkout: tool({
          description: "Place the order and complete checkout.",
          inputSchema: z.any(),
          execute: async () => {
            console.log("   -> TOOL CALL: checkout");
            return { success: true, orderNumber: "TDJ-TEST-123" };
          }
        })
      },
      maxSteps: 3,
    });

    let assistantText = "";
    for await (const chunk of result.fullStream) {
      if (chunk.type === 'text-delta') {
        assistantText += chunk.textDelta;
      }
    }
    if (assistantText.trim()) {
      console.log("AI Response:", assistantText.trim());
    }
  };

  await runIntent("Show me running products");
  await runIntent("Add Nike Dri-FIT Running Tee in size L to my cart");
  await runIntent("I want to remove Nike Dri-FIT Running Tee size M from the cart");
  await runIntent("I'm ready to place my order");

  await mongoose.disconnect();
}

main().catch(console.error);
