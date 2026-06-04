import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not defined.");
    return;
  }

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a luxury fashion stylist."
      },
      {
        role: "user",
        content: "show me jeans"
      },
      {
        role: "assistant",
        tool_calls: [
          {
            id: "call_jeans",
            type: "function",
            function: {
              name: "showProducts",
              arguments: "{\"query\":\"jeans\"}"
            }
          }
        ]
      },
      {
        role: "tool",
        tool_call_id: "call_jeans",
        name: "showProducts",
        content: "[]"
      },
      {
        role: "user",
        content: "What's in my cart?"
      }
    ],
    tools: [
      {
        type: "function",
        "function": {
          name: "showProducts",
          description: "Search products",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        "function": {
          name: "viewCart",
          description: "View cart",
          parameters: { type: "object", properties: {} }
        }
      }
    ]
  };

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
  console.log("Response Body:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
