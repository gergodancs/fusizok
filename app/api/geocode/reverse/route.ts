import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/location/geocode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number.parseFloat(searchParams.get("lat") ?? "");
  const lng = Number.parseFloat(searchParams.get("lng") ?? "");

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json({ error: "Érvénytelen koordináták." }, { status: 400 });
  }

  const place = await reverseGeocode(lat, lng);

  if (!place) {
    return NextResponse.json(
      { error: "Nem sikerült meghatározni a helyszínt." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    county: place.county,
    city: place.city,
    label: place.label,
  });
}
