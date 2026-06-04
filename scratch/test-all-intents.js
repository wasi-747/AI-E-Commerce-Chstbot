import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const tools = {
  showProducts: tool({
    description: "Search and filter the product catalog.",
    inputSchema: z.object({
      query: z.string().describe("The clothing query")
    }),
    execute: async ({ query }) => {
      console.log("   -> TOOL CALL: showProducts with query:", query);
      return {
        found: true,
        products: [
          { id: "p1", name: "Nike Dri-FIT Running Tee", brand: "Nike", price: 2800, inventory: { L: 5 } }
        ]
      };
    }
  }),
  addToCart: tool({
    description: "Add a specific product in a size to the cart. If you do not have the ID, search first.",
    inputSchema: z.object({
      productId: z.string().describe("MongoDB id"),
      size: z.enum(["S", "M", "L", "XL", "XXL"]),
      quantity: z.number().default(1)
    }),
    execute: async (args) => {
      console.log("   -> TOOL CALL: addToCart with args:", args);
      return { success: true, message: "Added successfully" };
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
      return { success: true, message: "Removed successfully" };
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
      return { success: true, orderNumber: "TDJ-TEST-1234" };
    }
  })
};

const systemPrompt =
  "You are an elite luxury fashion stylist for TechDojo Store. BE EXTREMELY CONCISE. Do not act like a generic chatty AI. Answer directly.\n\n" +
  "GUIDELINES:\n" +
  "- Search the catalog for clothes when requested (showProducts).\n" +
  "- View the shopping cart when asked about the cart (viewCart).\n" +
  "- For checkout, update, or remove actions, call the appropriate tool directly.\n" +
  "- For adding items: If you do not have the product ID, search for the product first using showProducts, then call addToCart with the ID.";

async function runTest(userMessage) {
  console.log(`\nUser: "${userMessage}"`);
  try {
    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools,
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
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

async function main() {
  await runTest("Show me running products");
  await runTest("Add Nike t-shirt in size L to my cart");
  await runTest("I want to remove Nike t-shirt size M from the cart");
  await runTest("I'm ready to place my order");
}

main().catch(console.error);
