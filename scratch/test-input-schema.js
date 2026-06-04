import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { tool } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const { browseProducts } = await import("../lib/chatTools.js");
  
  const systemPrompt =
    "You are a luxury fashion stylist. ALWAYS use the 'showProducts' tool when the user asks for clothes. REQUIRED: You MUST extract the clothing type and pass it to the 'query' parameter. If the user asks about their cart, use the 'viewCart' tool.";

  const showProducts = browseProducts;

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: [{ role: "user", content: "Show me Nike running tees" }],
    tools: {
      showProducts,
    },
    maxSteps: 3,
  });

  for await (const chunk of result.fullStream) {
    if (chunk.type === 'tool-call') {
      console.log("TOOL CALL DETECTED:", chunk);
    }
  }
}

main().catch(console.error);
