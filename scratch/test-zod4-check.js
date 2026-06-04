import { z } from "zod";

const schema = z.object({
  query: z.string()
});

console.log("_zod in schema:", "_zod" in schema);
console.log("schema._zod:", schema._zod);
