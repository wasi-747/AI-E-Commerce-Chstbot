import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const result = await streamText({
    model: groq("mixtral-8x7b-32768"),
    system: "You are a shopping assistant. Always use showProducts to search clothing.",
    messages: [{ role: "user", content: "Show me Nike running tees" }],
    tools: {
      showProducts: {
        description: "Search and filter the product catalog.",
        parameters: z.object({
          query: z.string().describe("The clothing search query")
        }),
        execute: async (args) => {
          console.log("EXECUTE showProducts args:", args);
          return { success: true, products: [] };
        }
      }
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
