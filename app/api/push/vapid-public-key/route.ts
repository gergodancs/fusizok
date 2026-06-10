import { NextResponse } from "next/server";
import {
  isValidVapidPublicKey,
  sanitizeVapidPublicKey,
} from "@/lib/push/vapid";

export function GET() {
  const raw = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!raw) {
    return NextResponse.json(
      { error: "VAPID kulcs nincs konfigurálva." },
      { status: 503 },
    );
  }

  const publicKey = sanitizeVapidPublicKey(raw);

  if (!isValidVapidPublicKey(publicKey)) {
    console.error(
      "[vapid-public-key] Érvénytelen NEXT_PUBLIC_VAPID_PUBLIC_KEY – futtasd: node scripts/generate-vapid-keys.mjs",
    );
    return NextResponse.json(
      { error: "Érvénytelen VAPID public key." },
      { status: 503 },
    );
  }

  return NextResponse.json({ publicKey });
}
