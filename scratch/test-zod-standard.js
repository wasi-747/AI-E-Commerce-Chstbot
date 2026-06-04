import { z } from "zod";

const schema = z.object({
  query: z.string()
});

console.log("~standard in schema:", "~standard" in schema);
if ("~standard" in schema) {
  console.log("vendor:", schema["~standard"]?.vendor);
}
console.log("typeof schema:", typeof schema);
console.log("_def in schema:", "_def" in schema);
