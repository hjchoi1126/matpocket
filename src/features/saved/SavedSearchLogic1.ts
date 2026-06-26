import type { Place } from "@/types/place";

export function SearchSavedPlacesLogic1(
  places: Place[],
  query: string,
  folderNameMap: Map<number, string>,
): Place[] {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return places;
  }

  return places.filter((place) => {
    const folderName = place.folder_id
      ? (folderNameMap.get(place.folder_id) ?? "")
      : "";
    const searchableText = [
      place.place_name,
      place.address,
      place.category,
      place.memo,
      folderName,
      ...place.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(trimmedQuery);
  });
}
