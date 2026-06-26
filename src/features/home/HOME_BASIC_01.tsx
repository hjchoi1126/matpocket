"use client";

import { useRouter } from "next/navigation";
import { ChefHat, Dices, Loader2, MapPin, Pill, Plus } from "lucide-react";
import RouletteModal from "@/components/features/RouletteModal";
import CurationModal from "@/components/features/CurationModal";
import GeoNotifierHeaderButton from "@/components/features/GeoNotifierHeaderButton";
import { useHomeBasic01F } from "@/features/home/HOME_BASIC_01F";
import { useHomeMap01F } from "@/features/home/HOME_MAP_01F";

export default function HOME_BASIC_01() {
  const router = useRouter();
  const {
    savedPlaces,
    isLoadingPlaces,
    isLoadingWeather,
    recommendationChipText,
    nickname,
    isRouletteOpen,
    setIsRouletteOpen,
    isCurationOpen,
    setIsCurationOpen,
  } = useHomeBasic01F();

  const { mapContainerRef, isMapReady, isLoadingLocation, mapError } =
    useHomeMap01F(savedPlaces);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" aria-hidden />
            <h1 className="text-lg font-bold text-gray-900">맛포켓</h1>
          </div>
          <GeoNotifierHeaderButton />
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
      {/* Kakao map */}
      <div className="absolute inset-0 z-0 bg-slate-200">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

        {(!isMapReady || isLoadingLocation) && !mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200/90 px-6 text-center">
            <Loader2
              className="mb-3 h-8 w-8 animate-spin text-primary"
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-600">
              {isLoadingLocation ? "위치 확인 중..." : "지도 불러오는 중..."}
            </p>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200 px-6 text-center">
            <MapPin className="mb-3 h-10 w-10 text-primary/40" aria-hidden />
            <p className="whitespace-pre-wrap text-sm font-medium text-slate-700">
              {mapError}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              .env.local의 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY를 확인해 주세요.
            </p>
          </div>
        )}

      </div>

      {/* Dashboard overlay */}
      <div className="absolute left-4 right-4 top-4 z-10">
        <div className="rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-gray-900">
              오늘도 맛있는 하루 되세요, {nickname}님! 🌟
            </p>
            {isMapReady && (
              <div className="shrink-0 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium ring-1 ring-gray-100">
                <span className="mr-2 inline-flex items-center gap-1 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  방문
                </span>
                <span className="inline-flex items-center gap-1 text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  미방문
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            저장된 맛집{" "}
            {isLoadingPlaces ? "..." : `${savedPlaces.length}개`}
          </p>

          <div className="mt-3">
            {isLoadingWeather ? (
              <span className="inline-block rounded-full bg-gray-100 px-3 py-1.5 text-[11px] text-gray-500">
                날씨 확인 중...
              </span>
            ) : (
              <p className="line-clamp-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium leading-relaxed text-primary">
                {recommendationChipText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="absolute bottom-6 left-4 right-20 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setIsRouletteOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-lg ring-1 ring-gray-200 transition-transform active:scale-95"
        >
          <Dices className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          오늘 뭐 먹지? 🎲
        </button>
        <button
          type="button"
          onClick={() => setIsCurationOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-transform active:scale-95"
        >
          <Pill className="h-4 w-4 shrink-0 text-white/95" aria-hidden />
          오늘의 미식 처방전 💊
        </button>
      </div>

      <RouletteModal
        isOpen={isRouletteOpen}
        places={savedPlaces}
        onClose={() => setIsRouletteOpen(false)}
      />

      <CurationModal
        isOpen={isCurationOpen}
        nickname={nickname}
        onClose={() => setIsCurationOpen(false)}
      />

      <button
        type="button"
        onClick={() => router.push("/map?tab=search")}
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl transition-transform active:scale-110"
        aria-label="맛집 검색"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} aria-hidden />
      </button>
      </div>
    </div>
  );
}
