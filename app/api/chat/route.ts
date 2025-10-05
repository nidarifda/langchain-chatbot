import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }

    const model = new ChatOpenAI({
      model: "gpt-4o-mini", // or gpt-3.5-turbo
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage(message),
    ]);

    return NextResponse.json({ reply: response.content });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
