import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const groqCompat = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const systemPrompt =
    "You are a luxury fashion stylist. ALWAYS use the 'showProducts' tool when the user asks for clothes. REQUIRED: You MUST extract the clothing type and pass it to the 'query' parameter. If the user asks about their cart, use the 'viewCart' tool.";

  const showProducts = {
    description: "Search and filter the product catalog. Returns up to 5 matching products.",
    parameters: z.object({
      query: z.string().describe("The exact search term, clothing item, or category requested by the user (e.g., 'running tees', 'black t-shirt', 'jeans').")
    }),
    execute: async ({ query }) => {
      console.log("EXECUTE query:", query);
      return [];
    }
  };

  const result = await streamText({
    model: groqCompat("llama-3.3-70b-versatile"),
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
    } else if (chunk.type === 'text-delta') {
      process.stdout.write(chunk.textDelta);
    }
  }
}

main().catch(console.error);
