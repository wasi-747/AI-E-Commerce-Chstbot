import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import mongoose from "mongoose";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const { dbConnect } = await import("../lib/mongodb.js");
  const { browseProducts, addToCart, viewCart } = await import("../lib/chatTools.js");
  const Cart = (await import("../models/Cart.js")).default;

  await dbConnect();
  console.log("Connected to MongoDB.");

  const userId = "6a20e8b7a9bc304703205ab4"; // Test User

  // Clear cart first for clean testing
  await Cart.deleteOne({ userId });
  console.log("Cleared test user's cart.");

  const systemPrompt =
    "You are an elite luxury fashion stylist for TechDojo Store. BE EXTREMELY CONCISE. Do not act like a generic chatty AI. Answer directly and elegantly.\n\n" +
    "GUIDELINES:\n" +
    "- Search the catalog for clothes when requested.\n" +
    "- View the shopping cart when asked about the cart or orders.\n" +
    "- For checkout or cart updates, perform the requested actions directly.\n" +
    "- For casual chat or non-shopping queries, reply politely in 1-2 short sentences without calling tools.";

  function bindUserId(toolDef, userId) {
    return {
      ...toolDef,
      execute: (params) => toolDef.execute({ ...params, userId }),
    };
  }

  const boundTools = {
    showProducts: browseProducts,
    addToCart: bindUserId(addToCart, userId),
    viewCart: bindUserId(viewCart, userId),
  };

  try {
    console.log("Starting generateText...");
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: "Add Nike Running Tee in size M to my cart" }],
      tools: boundTools,
      temperature: 0,
      stopWhen: stepCountIs(3),
    });

    console.log("\nSTEPS RUN:", result.steps.length);
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      console.log(`\n--- Step ${i + 1} ---`);
      console.log("Text:", step.text);
      console.log("Tool Calls:", JSON.stringify(step.toolCalls, null, 2));
      console.log("Tool Results:", JSON.stringify(step.toolResults, null, 2));
    }
    console.log("\nFINAL TEXT:", result.text);

    // Verify cart in DB
    const cart = await Cart.findOne({ userId }).populate("items.productId").lean();
    console.log("\n=== Real Database Cart State ===");
    console.log(JSON.stringify(cart, null, 2));

  } catch (err) {
    console.error("FAILED:", err.message, err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main().catch(console.error);
