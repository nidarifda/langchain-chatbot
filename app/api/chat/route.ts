import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Debug: Check if we're receiving the message
    console.log("📨 Received message:", message);

    const apiKey = process.env.OPENAI_API_KEY;

    // Debug: Check if API key exists (but don't log the actual key)
    console.log("🔑 API Key present:", !!apiKey);

    if (!apiKey) {
      console.error("❌ Missing OpenAI API Key");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("🤖 Initializing OpenAI model...");

    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    console.log("💬 Sending message to OpenAI...");

    const humanMessage = new HumanMessage(message);
    const response = await model.invoke([humanMessage]);

    console.log("✅ Received response from OpenAI");

    return NextResponse.json({ 
      reply: response.content 
    });

  } catch (error: any) {
    console.error("❌ API Route Error:", error);
    
    // More specific error handling
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      );
    }
    
    if (error.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "OpenAI rate limit exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
