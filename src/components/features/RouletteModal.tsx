"use client";

import { useEffect, useState } from "react";
import { Dices, Loader2, X } from "lucide-react";
import {
  GetUnvisitedPlacesLogic1,
  PickRandomUnvisitedLogic1,
} from "@/features/home/RouletteLogic1";
import type { Place } from "@/types/place";

type RouletteModalProps = {
  isOpen: boolean;
  places: Place[];
  onClose: () => void;
};

export default function RouletteModal({
  isOpen,
  places,
  onClose,
}: RouletteModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [winner, setWinner] = useState<Place | null>(null);

  const unvisitedPlaces = GetUnvisitedPlacesLogic1(places);

  useEffect(() => {
    if (!isOpen) {
      setIsSpinning(false);
      setDisplayName("");
      setWinner(null);
    }
  }, [isOpen]);

  const HandleSpin = () => {
    if (unvisitedPlaces.length === 0 || isSpinning) return;

    const finalWinner = PickRandomUnvisitedLogic1(places);
    if (!finalWinner) return;

    setIsSpinning(true);
    setWinner(null);

    let tick = 0;
    const maxTicks = 18;
    const names = unvisitedPlaces.map((place) => place.place_name);

    const intervalId = window.setInterval(() => {
      const randomName = names[tick % names.length] ?? "";
      setDisplayName(randomName);
      tick += 1;

      if (tick >= maxTicks) {
        window.clearInterval(intervalId);
        setDisplayName(finalWinner.place_name);
        setWinner(finalWinner);
        setIsSpinning(false);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">오늘 뭐 먹지? 🎲</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-6">
          {unvisitedPlaces.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                아직 안 가본 맛집이 없어요.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                새 맛집을 저장하거나 방문 취소 후 다시 시도해 보세요.
              </p>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 to-orange-50 px-4 py-8 text-center">
                <div
                  className={`min-h-16 transition-all duration-150 ${
                    isSpinning ? "scale-105 opacity-90" : "scale-100"
                  }`}
                >
                  <p className="text-xs font-medium text-primary">
                    {isSpinning ? "룰렛 돌리는 중..." : "당첨 맛집"}
                  </p>
                  <p
                    className={`mt-2 text-xl font-bold text-gray-900 ${
                      isSpinning ? "animate-pulse" : ""
                    }`}
                  >
                    {displayName || "버튼을 눌러 뽑아보세요"}
                  </p>
                </div>
              </div>

              {winner && !isSpinning && (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-semibold text-primary">당첨!</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    {winner.place_name}
                  </h3>
                  {winner.category && (
                    <p className="mt-1 text-sm text-gray-500">
                      {winner.category}
                    </p>
                  )}
                  {winner.memo && (
                    <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm text-gray-600">
                      {winner.memo}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={isSpinning}
                onClick={HandleSpin}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {isSpinning ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Dices className="h-4 w-4" aria-hidden />
                )}
                {isSpinning ? "추첨 중..." : "룰렛 돌리기"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                미방문 맛집 {unvisitedPlaces.length}곳 중 1곳을 뽑아요
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
