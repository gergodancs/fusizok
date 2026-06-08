import { ImageResponse } from "next/og";
import { FzIconMark } from "@/lib/brand/fz-icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<FzIconMark size={32} />, { ...size });
}
