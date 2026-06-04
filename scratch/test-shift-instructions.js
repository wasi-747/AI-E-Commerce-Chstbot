import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateText, tool, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import mongoose from "mongoose";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function runOnce(runId) {
  console.log(`\n=== Run #${runId} ===`);
  const systemPrompt =
    "You are an elite luxury fashion stylist for TechDojo Store. BE EXTREMELY CONCISE. Do not act like a generic chatty AI. Answer directly and elegantly.";

  const showProducts = tool({
    description: "Search and filter the product catalog. Returns matching products.",
    inputSchema: z.object({
      query: z.string().describe("The search term.")
    }),
    execute: async ({ query }) => {
      console.log("EXECUTE showProducts query:", query);
      return {
        found: true,
        products: [
          { id: "6a20e409fbc55ad06bc650a5", name: "Nike Dri-FIT Running Tee" }
        ]
      };
    }
  });

  const addToCart = tool({
    description: "Add a product by its ID and size to the cart. If you do not have the ID, search for the product first.",
    inputSchema: z.object({
      productId: z.string().describe("The MongoDB _id of the product to add"),
      size: z.enum(["S", "M", "L", "XL", "XXL"]).describe("The clothing size"),
      quantity: z.number().int().min(1).default(1).describe("Quantity to add")
    }),
    execute: async ({ productId, size, quantity }) => {
      console.log(`EXECUTE addToCart: productId="${productId}" size="${size}" quantity=${quantity}`);
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return {
          success: false,
          reason: "invalid_product_id",
          message: `Invalid product ID: ${productId}. Please search for the product first using showProducts to get the correct product ID.`,
        };
      }
      return { success: true, message: `Added ${quantity} Nike Dri-FIT tee (Size ${size}) to cart.` };
    }
  });

  const viewCart = tool({
    description: "View the contents of the cart.",
    inputSchema: z.object({}),
    execute: async () => ({})
  });

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: "Add Nike Dri-FIT tee in size M to my cart" }],
      tools: {
        showProducts,
        addToCart,
        viewCart
      },
      temperature: 0,
      stopWhen: stepCountIs(3),
    });

    console.log("STEPS RUN:", result.steps.length);
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      console.log(`  Step ${i + 1} Tool Calls:`, JSON.stringify(step.toolCalls.map(tc => tc.toolName), null, 2));
    }
    console.log("FINAL TEXT:", result.text);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

async function main() {
  for (let i = 1; i <= 3; i++) {
    await runOnce(i);
  }
}

main().catch(console.error);
