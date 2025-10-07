import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message, model = "gpt-4o-mini" } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: model,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const humanMessage = new HumanMessage(message);
    const response = await chatModel.invoke([humanMessage]);

    return NextResponse.json({ 
      reply: response.content 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }
    
    if (error.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Sorry, I'm having trouble responding right now. Please try again." },
      { status: 500 }
    );
  }
}
