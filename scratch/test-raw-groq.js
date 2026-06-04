import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not defined.");
    return;
  }

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a luxury fashion stylist. ALWAYS use the 'showProducts' tool when the user asks for clothes. REQUIRED: You MUST extract the clothing type and pass it to the 'query' parameter."
      },
      {
        role: "user",
        content: "Show me Nike running tees"
      }
    ],
    tools: [
      {
        type: "function",
        "function": {
          name: "showProducts",
          description: "Search and filter the product catalog. Returns up to 5 matching products.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The exact search term, clothing item, or category requested by the user (e.g., 'running tees', 'black t-shirt', 'jeans')."
              }
            },
            required: ["query"]
          }
        }
      }
    ],
    tool_choice: "auto"
  };

  console.log("Sending request to Groq API...");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Response Status:", res.status);
  console.log("Raw Response Body:\n", JSON.stringify(data, null, 2));
}

main().catch(console.error);
