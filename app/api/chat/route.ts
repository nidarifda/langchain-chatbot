import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing OpenAI API Key in environment variables");
      return NextResponse.json(
        { error: "Missing OpenAI API Key" },
        { status: 500 }
      );
    }

    console.log("🔑 API Key exists, initializing model...");
    console.log("📝 Message received:", message);

    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    console.log("🤖 Model initialized, invoking...");

    // Use HumanMessage for proper formatting
    const humanMessage = new HumanMessage(message);
    const response = await model.invoke([humanMessage]);

    console.log("✅ Response received:", response.content);

    return NextResponse.json({ reply: response.content });
  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
