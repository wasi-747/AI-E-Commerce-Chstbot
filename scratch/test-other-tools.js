import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { tool } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function runToolTest(userMessage) {
  console.log(`\n--- Testing user query: "${userMessage}" ---`);
  
  const systemPrompt =
    "You are an elite luxury fashion stylist for TechDojo Store. BE EXTREMELY CONCISE. Do not act like a generic chatty AI. Answer directly.\n\nRULES:\n1. CLOTHING SEARCH: If the user asks for clothes, ALWAYS use the 'showProducts' tool. You MUST pass their entire request into the SINGLE 'query' parameter.\n2. CART/ORDERS: If they ask about their cart or orders, use the 'viewCart' tool.\n3. ADD TO CART: If they want to add something to their cart, use 'addToCart'.";

  const showProducts = tool({
    description: "Search and filter the product catalog. Returns up to 5 matching products.",
    inputSchema: z.object({
      query: z.string()
    }),
    execute: async () => []
  });

  const viewCart = tool({
    description: "Fetch and display the current contents of the user's shopping cart.",
    inputSchema: z.object({}),
    execute: async () => ({})
  });

  const addToCart = tool({
    description: "Add a specific product in a specific size to the user's shopping cart.",
    inputSchema: z.object({
      productId: z.string().describe("The MongoDB _id of the product to add"),
      size: z.enum(["S", "M", "L", "XL", "XXL"]).describe("The clothing size"),
      quantity: z.number().int().min(1).default(1).describe("Quantity to add")
    }),
    execute: async () => ({})
  });

  try {
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools: {
        showProducts,
        viewCart,
        addToCart
      },
      maxSteps: 3,
    });

    for await (const chunk of result.fullStream) {
      if (chunk.type === 'tool-call') {
        console.log("TOOL CALL:", chunk.toolName, "Args:", chunk.input);
      }
    }
  } catch (err) {
    console.error("FAILED:", err.message, err);
  }
}

async function main() {
  // Test 1: Add to cart
  await runToolTest("Add Nike Dri-FIT tee in size M");
  
  // Test 2: View cart
  await runToolTest("What's in my cart?");
}

main().catch(console.error);
