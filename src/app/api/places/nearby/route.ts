import { NextResponse } from "next/server";
import { NearbyPlacesServerLogic1 } from "@/lib/NearbyPlacesServerLogic1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusKm = Number(searchParams.get("radius_km") ?? "1");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "위도와 경도가 필요합니다." },
      { status: 400 },
    );
  }

  if (Number.isNaN(radiusKm) || radiusKm <= 0) {
    return NextResponse.json(
      { error: "반경(radius_km)은 0보다 커야 합니다." },
      { status: 400 },
    );
  }

  try {
    const result = await NearbyPlacesServerLogic1({ lat, lng, radiusKm });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ places: result.places });
  } catch {
    return NextResponse.json(
      { error: "Supabase 연결에 실패했습니다." },
      { status: 500 },
    );
  }
}
