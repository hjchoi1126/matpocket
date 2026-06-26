"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useMapSearch01F } from "@/features/map/MAP_SEARCH_01F";

type MapSearch01Props = {
  initialQuery?: string;
};

export default function MAP_SEARCH_01({ initialQuery = "" }: MapSearch01Props) {
  const {
    mapContainerRef,
    query,
    setQuery,
    places,
    selectedPlaceId,
    savedPlaceIds,
    isSearching,
    isMapReady,
    isLoadingLocation,
    savingPlaceId,
    errorMessage,
    statusMessage,
    HandleSearch,
    HandleSelectPlace,
    HandleSavePlace,
  } = useMapSearch01F(initialQuery);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        className="flex gap-2 border-b border-gray-100 px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void HandleSearch();
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="맛집 이름, 메뉴, 지역 검색"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-3 pl-10 text-sm outline-none focus:border-primary focus:bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            "검색"
          )}
        </button>
      </form>

      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gray-100">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            {isLoadingLocation ? "위치 확인 중..." : "지도 불러오는 중..."}
          </div>
        )}
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {errorMessage && (
          <p className="mb-3 whitespace-pre-wrap break-words rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {statusMessage && (
          <p className="mb-3 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {statusMessage}
          </p>
        )}

        {places.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            카카오 맛집을 검색해 보세요.
          </p>
        ) : (
          <ul className="space-y-3 pb-4">
            {places.map((place) => {
              const isSelected = selectedPlaceId === place.id;
              const isSaved = savedPlaceIds.has(place.place_url);
              const isSaving = savingPlaceId === place.id;

              return (
                <li key={place.id}>
                  <article
                    className={`rounded-2xl border p-4 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => HandleSelectPlace(place)}
                      className="w-full text-left"
                    >
                      <h2 className="font-semibold text-gray-900">
                        {place.place_name}
                      </h2>
                      <p className="mt-1 text-xs text-gray-400">
                        {place.category_name}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {place.road_address_name || place.address_name}
                      </p>
                    </button>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        disabled={isSaved || isSaving}
                        onClick={() => void HandleSavePlace(place)}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:bg-gray-300"
                      >
                        {isSaving ? "저장 중..." : isSaved ? "저장됨" : "저장하기"}
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
