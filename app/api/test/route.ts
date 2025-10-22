import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.OPENAI_API_KEY,
    prefix: process.env.OPENAI_API_KEY?.slice(0, 8) || "undefined",
    env: process.env.VERCEL_ENV || "unknown",
  });
}
