// app/api/chat/route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs"; // required for external fetch

export async function POST(req: Request) {
  try {
    const { message, model = "gpt-4o-mini" } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey)
      return NextResponse.json({ error: "No API key" }, { status: 500 });
    if (!message?.trim())
      return NextResponse.json({ error: "Empty message" }, { status: 400 });

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

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "No reply.";
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("💥 Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
