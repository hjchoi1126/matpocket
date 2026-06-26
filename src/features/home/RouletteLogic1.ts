import type { Place } from "@/types/place";

export function PickRandomUnvisitedLogic1(places: Place[]): Place | null {
  const candidates = places.filter((place) => !place.visited);

  if (candidates.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] ?? null;
}

export function GetUnvisitedPlacesLogic1(places: Place[]): Place[] {
  return places.filter((place) => !place.visited);
}
