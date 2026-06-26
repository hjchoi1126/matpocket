import { HaversineDistanceKm } from "@/utils/distance";
import type { Place } from "@/types/place";

export type NearbyGeoPlace = Place & {
  distance_km: number;
};

export const GEO_FENCE_RADIUS_KM = 0.1;

export function FilterNearbyPlacesLogic1(
  places: Place[],
  latitude: number,
  longitude: number,
  radiusKm: number = GEO_FENCE_RADIUS_KM,
): NearbyGeoPlace[] {
  return places
    .filter(
      (place) =>
        place.latitude != null &&
        place.longitude != null &&
        !Number.isNaN(place.latitude) &&
        !Number.isNaN(place.longitude),
    )
    .map((place) => ({
      ...place,
      distance_km: HaversineDistanceKm(
        latitude,
        longitude,
        place.latitude!,
        place.longitude!,
      ),
    }))
    .filter((place) => place.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}
