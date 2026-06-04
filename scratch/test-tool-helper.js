import { tool } from "ai";
import { z } from "zod";

const t1 = tool({
  description: "test",
  parameters: z.object({ query: z.string() }),
  execute: async () => {}
});

const t2 = tool({
  description: "test",
  inputSchema: z.object({ query: z.string() }),
  execute: async () => {}
});

console.log("t1 parameters:", t1.parameters ? "yes" : "no");
console.log("t2 parameters:", t2.parameters ? "yes" : "no");
console.log("t2 inputSchema:", t2.inputSchema ? "yes" : "no");
console.log("t2 keys:", Object.keys(t2));

