import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini", // ✅ correct key
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage(message),
    ]);

    return NextResponse.json({ reply: response.content });
  } catch (err: any) {
    console.error("❌ API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to connect to OpenAI" },
      { status: 500 }
    );
  }
}
