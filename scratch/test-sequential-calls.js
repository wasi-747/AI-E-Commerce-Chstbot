import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateText, tool, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const systemPrompt = "You are a helpful assistant.";

  const stepOne = tool({
    description: "Step one tool.",
    inputSchema: z.object({}),
    execute: async () => {
      console.log("EXECUTE stepOne");
      return { secretKey: "xyz123" };
    }
  });

  const stepTwo = tool({
    description: "Step two tool. Pass the secretKey from stepOne.",
    inputSchema: z.object({
      secretKey: z.string()
    }),
    execute: async ({ secretKey }) => {
      console.log("EXECUTE stepTwo with key:", secretKey);
      return { status: "success" };
    }
  });

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: "Run step one to get the secret key, and then run step two using that key." }],
      tools: {
        stepOne,
        stepTwo
      },
      stopWhen: stepCountIs(5),
    });

    console.log("\nTOTAL STEPS RUN:", result.steps.length);
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      console.log(`\n--- Step ${i + 1} ---`);
      console.log("Text:", step.text);
      console.log("Tool Calls:", JSON.stringify(step.toolCalls, null, 2));
    }
    console.log("\nFINAL TEXT:", result.text);
  } catch (err) {
    console.error("\nFAILED:", err.message);
  }
}

main().catch(console.error);
