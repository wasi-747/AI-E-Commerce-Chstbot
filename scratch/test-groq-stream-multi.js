import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { streamText, tool } from "ai";
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
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: "Run step one to get the secret key, and then run step two using that key." }],
      tools: {
        stepOne,
        stepTwo
      },
      maxSteps: 5,
    });

    for await (const chunk of result.fullStream) {
      console.log("STREAM CHUNK:", chunk.type);
      if (chunk.type === "text-delta") {
        process.stdout.write(chunk.textDelta);
      }
    }
    console.log();
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

main().catch(console.error);
