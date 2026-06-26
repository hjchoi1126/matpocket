import type { GeoPosition, KakaoPlace } from "@/types/restaurant";

type SearchLogic1Params = {
  query: string;
  position?: GeoPosition | null;
};

type SearchLogic1Result = {
  places: KakaoPlace[];
  error?: string;
};

export async function SearchLogic1({
  query,
  position,
}: SearchLogic1Params): Promise<SearchLogic1Result> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { places: [], error: "검색어를 입력해 주세요." };
  }

  const params = new URLSearchParams({ query: trimmedQuery });

  if (position) {
    params.set("x", String(position.lng));
    params.set("y", String(position.lat));
  }

  const response = await fetch(`/api/search?${params.toString()}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    return {
      places: [],
      error: payload?.error ?? "맛집 검색에 실패했습니다.",
    };
  }

  const data = (await response.json()) as { documents?: KakaoPlace[] };

  return {
    places: data.documents ?? [],
  };
}
