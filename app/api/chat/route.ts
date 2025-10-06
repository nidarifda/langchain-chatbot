import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY!;

    if (!apiKey) {
      console.error("❌ Missing OpenAI API Key in environment variables");
      return NextResponse.json(
        { error: "Missing OpenAI API Key" },
        { status: 500 }
      );
    }

    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini"
    });

    const response = await model.invoke([{ role: "user", content: message }]);

    return NextResponse.json({ reply: response.content });
  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
