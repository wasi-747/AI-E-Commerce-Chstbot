import { convertToModelMessages, streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import {
  browseProducts,
  addToCart,
  removeFromCart,
  viewCart,
  checkout,
} from "@/lib/chatTools";

export const dynamic = "force-dynamic";

// ── Groq provider (uses Chat Completions natively) ──────────────────────────
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const userId = session.user.id;

    const reqBody = await req.json();
    console.log("POST /api/chat reqBody:", reqBody);
    const uiMessages = Array.isArray(reqBody.messages) ? reqBody.messages : [];
    const modelMessages = await convertToModelMessages(uiMessages);

    // ── 3. Slice messages to save tokens while keeping raw objects ───────────
    const recentMessages = modelMessages.slice(-6);

    // ── 3b. Ensure DB connection for chat persistence ───────────────────────
    await dbConnect();

    // ── 4. System prompt ───────────────────────────────────────────────────
    const systemPrompt =
      "You are a luxury fashion stylist. ALWAYS use the 'showProducts' tool when the user asks for clothes. REQUIRED: You MUST extract the clothing type and pass it to the 'query' parameter. If the user asks about their cart, use the 'viewCart' tool.";

    // ── 5. Inject userId into tools that need it ───────────────────────────
    // We create tool wrappers that bind userId from the session so the LLM
    // cannot tamper with it (it's never exposed in the prompt).
    const boundTools = {
      showProducts: browseProducts,
      addToCart: bindUserId(addToCart, userId),
      removeFromCart: bindUserId(removeFromCart, userId),
      viewCart: bindUserId(viewCart, userId),
      checkout: bindUserId(checkout, userId),
    };

    // ── 6. Stream LLM response ─────────────────────────────────────────────
    let result;
    try {
      result = await streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: recentMessages,
        tools: boundTools,
        maxSteps: 3,
        onFinish: async ({ text }) => {
          try {
            const lastUserMessage = [...uiMessages]
              .reverse()
              .find((m) => m.role === "user");
            const userContent = extractTextContent(lastUserMessage);

            if (userContent && text) {
              await User.findByIdAndUpdate(userId, {
                $push: {
                  chatHistory: {
                    $each: [
                      { role: "user", content: userContent },
                      { role: "assistant", content: text },
                    ],
                  },
                },
              });
            }
          } catch (err) {
            console.error("Failed to persist chat history:", err.message);
          }
        },
      });
      console.log("streamText success, result keys:", Object.keys(result));
    } catch (streamErr) {
      console.error("[STREAM_TEXT_ERROR]:", streamErr);
      throw streamErr;
    }

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("Stream error in route:", error);
        return "An error occurred.";
      },
    });
  } catch (error) {
    console.error("[CHAT_API_FATAL_ERROR]:", error);
    return new Response(
      JSON.stringify({ error: "Chat service unavailable. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a tool wrapper that pre-fills the userId parameter from the
 * server-side session, preventing any client-side userId injection.
 */
function bindUserId(toolDef, userId) {
  return {
    ...toolDef,
    execute: (params) => toolDef.execute({ ...params, userId }),
  };
}

/**
 * Extract plain text content from a message object (handles both
 * string content and parts arrays from the AI SDK).
 */
function extractTextContent(message) {
  if (!message) return "";
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ");
  }
  if (Array.isArray(message.content)) {
    return message.content
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ");
  }
  return "";
}

