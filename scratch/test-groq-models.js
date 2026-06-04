import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function runTest(modelName, useSystemPrompt, schema) {
  console.log(`\n--- Testing ${modelName} (System Prompt: ${useSystemPrompt}) ---`);
  
  const system = useSystemPrompt
    ? "You are a luxury fashion stylist. ALWAYS use the 'showProducts' tool when the user asks for clothes. REQUIRED: You MUST extract the clothing type and pass it to the 'query' parameter."
    : undefined;

  try {
    const result = await streamText({
      model: groq(modelName),
      system,
      messages: [{ role: "user", content: "Show me Nike running tees" }],
      tools: {
        showProducts: {
          description: "Search and filter the product catalog. Returns up to 5 matching products.",
          parameters: schema,
          execute: async (args) => {
            console.log("EXECUTE args:", args);
            return [];
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
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function main() {
  const schema1 = z.object({
    query: z.string().describe("The exact search term, clothing item, or category requested by the user (e.g., 'running tees', 'black t-shirt', 'jeans').")
  });

  const schema2 = z.object({
    query: z.string()
  });

  // Test 1: llama-3.3-70b-versatile with system prompt and detailed schema
  await runTest("llama-3.3-70b-versatile", true, schema1);

  // Test 2: llama-3.3-70b-versatile without system prompt and simple schema
  await runTest("llama-3.3-70b-versatile", false, schema2);

  // Test 3: llama-3.1-8b-instant with system prompt and detailed schema
  await runTest("llama-3.1-8b-instant", true, schema1);
}

main().catch(console.error);
