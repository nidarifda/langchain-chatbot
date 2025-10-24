export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, model = "gpt-4o-mini" } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "❌ Missing OpenAI API key" },
        { status: 500 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenAI API Error:", text);
      return NextResponse.json({ error: "OpenAI API call failed" }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No response.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Server-side error occurred." },
      { status: 500 }
    );
  }
}
