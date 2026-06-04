import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function runTest(label, systemPrompt, tools, userMessage) {
  console.log(`\n--- ${label} ---`);
  try {
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools,
      maxSteps: 3,
    });

    for await (const chunk of result.fullStream) {
      if (chunk.type === 'tool-call') {
        console.log("SUCCESS TOOL CALL:", chunk.toolName, "Args:", chunk.input);
      } else if (chunk.type === 'text-delta') {
        process.stdout.write(chunk.textDelta);
      }
    }
    console.log();
  } catch (err) {
    console.error("FAILED:", err.message, err.responseBody || "");
  }
}

async function main() {
  const showProducts = tool({
    description: "Search and filter the product catalog. Returns up to 5 matching products.",
    inputSchema: z.object({
      query: z.string().describe("The exact search term, clothing item, or category requested by the user.")
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

  const systemPrompt = "You are a shopping assistant. Use 'viewCart' when asked about the cart. Use 'showProducts' when asked about clothes. Use 'addToCart' to add an item.";

  const allTools = { showProducts, viewCart, addToCart };

  // Test 4: All tools, What's in my cart?
  await runTest("Test 4: All tools, What's in my cart?", systemPrompt, allTools, "What's in my cart?");

  // Test 5: All tools, Add Nike Dri-FIT tee in size M
  await runTest("Test 5: All tools, Add Nike Dri-FIT tee in size M", systemPrompt, allTools, "Add Nike Dri-FIT tee in size M");
}

main().catch(console.error);
