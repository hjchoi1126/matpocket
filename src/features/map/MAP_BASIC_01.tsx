"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, MapPin, Navigation } from "lucide-react";
import PlaceListItem from "@/components/features/PlaceListItem";
import PlaceRegisterSheet from "@/components/features/PlaceRegisterSheet";
import MAP_SEARCH_01 from "@/features/map/MAP_SEARCH_01";
import { useMapBasic01F } from "@/features/map/MAP_BASIC_01F";
import type { NearbyPlace, Place } from "@/types/place";

function MapBasic01Content() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const initialQuery = searchParams.get("q") ?? "";

  const {
    mapContainerRef,
    displayPlaces,
    isLoadingLocation,
    isSearchingNearby,
    isMapReady,
    togglingPlaceId,
    errorMessage,
    statusMessage,
    activeTab,
    setActiveTab,
    HandleNearbySearch,
    HandleToggleVisit,
    ReloadSavedPlaces,
  } = useMapBasic01F();

  useEffect(() => {
    if (initialTab === "search") {
      setActiveTab("search");
    }
  }, [initialTab, setActiveTab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-gray-900">지도</h1>
          <PlaceRegisterSheet onSaved={() => void ReloadSavedPlaces()} />
        </div>
        <div className="mt-3 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("nearby")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
              activeTab === "nearby"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            내 주변 저장
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
              activeTab === "search"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            맛집 검색
          </button>
        </div>
      </header>

      {activeTab === "search" ? (
        <MAP_SEARCH_01 initialQuery={initialQuery} />
      ) : (
        <>
          <div className="relative h-52 w-full shrink-0 overflow-hidden bg-gray-100">
            <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
            {!isMapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                {isLoadingLocation ? "위치 확인 중..." : "지도 불러오는 중..."}
              </div>
            )}
            <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium shadow-sm">
              <span className="mr-2 inline-flex items-center gap-1 text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                방문
              </span>
              <span className="inline-flex items-center gap-1 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                미방문
              </span>
            </div>
          </div>

          <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <button
              type="button"
              disabled={isLoadingLocation || isSearchingNearby}
              onClick={() => void HandleNearbySearch()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSearchingNearby ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Navigation className="h-4 w-4" aria-hidden />
              )}
              내 주변 1km 맛집 보기
            </button>

            {errorMessage && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            {statusMessage && (
              <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
                {statusMessage}
              </p>
            )}

            {displayPlaces.length === 0 ? (
              <div className="mt-6 flex flex-col items-center py-10 text-center">
                <MapPin className="mb-3 h-10 w-10 text-gray-200" aria-hidden />
                <p className="text-sm text-gray-500">
                  저장한 맛집 중 가까운 곳을 찾아볼 수 있어요.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  위도·경도가 등록된 맛집만 지도에 표시됩니다.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3 pb-4">
                {displayPlaces.map((place) => (
                  <li key={place.id}>
                    <PlaceListItem
                      place={place}
                      isToggling={togglingPlaceId === place.id}
                      trailing={
                        "distance_km" in place ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {((place as NearbyPlace).distance_km * 1000).toFixed(0)}m
                          </span>
                        ) : undefined
                      }
                      onToggleVisit={(item) => void HandleToggleVisit(item)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default function MAP_BASIC_01() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          지도 불러오는 중...
        </div>
      }
    >
      <MapBasic01Content />
    </Suspense>
  );
}
