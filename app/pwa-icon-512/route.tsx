import { ImageResponse } from "next/og";
import { FzIconMark } from "@/lib/brand/fz-icon-mark";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<FzIconMark size={512} maskable />, {
    width: 512,
    height: 512,
  });
}
