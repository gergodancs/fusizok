import { NextResponse } from "next/server";

export function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPID kulcs nincs konfigurálva." },
      { status: 503 },
    );
  }

  return NextResponse.json({ publicKey });
}
