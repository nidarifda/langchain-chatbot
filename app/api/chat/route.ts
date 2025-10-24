// app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

export async function POST(req: Request) {
  try {
    const { message, model = "gpt-4o-mini" } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ OpenAI API error:", errText);
      return NextResponse.json({ error: "OpenAI API call failed" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply received.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ error: "Server-side error occurred." }, { status: 500 });
  }
}
