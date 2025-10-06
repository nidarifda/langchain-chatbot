import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey: process.env.OPENAI_API_KEY!;
    if (!apiKey) {
      console.error("❌ Missing OpenAI API Key in environment variables");
      return NextResponse.json(
        { error: "Missing OpenAI API Key. Please check your Vercel settings." },
        { status: 500 }
      );
    }

    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      model: "gpt-4o-mini",
      temperature: 0.7,
    });

    const response = await model.invoke([
      new SystemMessage("You are a friendly and helpful assistant."),
      new HumanMessage(message),
    ]);

    return NextResponse.json({ reply: response.content });
  } catch (err: any) {
    console.error("🔥 Server error:", err);
    return NextResponse.json(
      { error: "Server error. Please check your API configuration." },
      { status: 500 }
    );
  }
}
