import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const result = await streamText({
    model: groq("llama-3.1-8b-instant"),
    system: "You are a luxury fashion stylist for TechDojo Store. You help users shop. " +
            "CRITICAL: If the user wants to browse products, you MUST call 'showProducts' and provide a search term in the 'query' parameter.",
    messages: [{ role: "user", content: "Show me running products" }],
    tools: {
      showProducts: tool({
        description: "Search and filter the product catalog.",
        inputSchema: z.object({
          query: z.string().describe("The clothing search query")
        }),
        execute: async ({ query }) => {
          console.log("EXECUTE showProducts query:", query);
          return { success: true, products: [] };
        }
      })
    },
    maxSteps: 3,
  });

  for await (const chunk of result.fullStream) {
    if (chunk.type === 'tool-call') {
      console.log("TOOL CALL:", chunk.toolName, "Args:", chunk.input);
    }
  }
}

main().catch(console.error);
