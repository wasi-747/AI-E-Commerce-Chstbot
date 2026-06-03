import { streamText, convertToModelMessages } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const dynamic = 'force-dynamic';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { messages } = await req.json();

  // Convert UIMessages (with parts) from frontend to ModelMessages (with content) for streamText
  const modelMessages = await convertToModelMessages(messages);

  const result = await streamText({
    model: groq('llama-3.1-8b-instant'),
    system: "You are a luxury fashion stylist for an elite boutique. Provide minimalist, professional, and elegant style advice. Keep responses short and formatting clean.",
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
