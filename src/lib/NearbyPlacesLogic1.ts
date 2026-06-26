import type { NearbyPlace } from "@/types/place";

type NearbyPlacesLogic1Params = {
  lat: number;
  lng: number;
  radiusKm?: number;
};

type NearbyPlacesLogic1Result = {
  places: NearbyPlace[];
  error?: string;
};

export function CalcDistanceKmLogic1(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function NearbyPlacesLogic1({
  lat,
  lng,
  radiusKm = 1,
}: NearbyPlacesLogic1Params): Promise<NearbyPlacesLogic1Result> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_km: String(radiusKm),
  });

  const response = await fetch(`/api/places/nearby?${params.toString()}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    return {
      places: [],
      error: payload?.error ?? "주변 맛집을 불러오지 못했습니다.",
    };
  }

  const data = (await response.json()) as { places?: NearbyPlace[] };
  return { places: data.places ?? [] };
}
