import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { message, userId } = body;

    if (!message || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: message, userId",
        },
        { status: 400 },
      );
    }

    // TODO: Connect to Local LLM (Ollama/Llama-3) via RTX 5070 for intent extraction

    return NextResponse.json(
      {
        success: true,
        message: "AI integration pending - Waiting for local GPU setup",
        userId,
        userMessage: message,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process chat request",
      },
      { status: 500 },
    );
  }
}
