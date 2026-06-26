import { CalcDistanceKmLogic1 } from "@/lib/NearbyPlacesLogic1";
import { CreateSupabaseServerClient } from "@/lib/supabaseServer";
import type { NearbyPlace, Place } from "@/types/place";

export async function NearbyPlacesServerLogic1({
  lat,
  lng,
  radiusKm,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
}): Promise<{ places: NearbyPlace[]; error?: string }> {
  const supabase = CreateSupabaseServerClient();

  const { data, error } = await supabase.rpc("nearby_places", {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
  });

  if (!error) {
    return { places: (data ?? []) as NearbyPlace[] };
  }

  const { data: allPlaces, error: selectError } = await supabase
    .from("places")
    .select("*")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (selectError) {
    const hint = selectError.message.includes("places")
      ? "places 테이블이 없습니다. supabase/setup_all.sql 전체를 실행해 주세요."
      : selectError.message;

    return {
      places: [],
      error: `주변 맛집 조회 실패: ${hint}`,
    };
  }

  const places = ((allPlaces ?? []) as Place[])
    .map((place) => ({
      ...place,
      distance_km: CalcDistanceKmLogic1(
        lat,
        lng,
        place.latitude as number,
        place.longitude as number,
      ),
    }))
    .filter((place) => place.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);

  return { places };
}
