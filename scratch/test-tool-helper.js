import { tool } from "ai";
import { z } from "zod";

const t = tool({
  description: "test",
  parameters: z.object({ query: z.string() }),
  execute: async () => {}
});

console.log("TOOL:", t);
console.log("parameters" in t);
console.log("inputSchema" in t);
