"use client";

import { Loader2, Trophy } from "lucide-react";
import PlayGameHeader from "@/components/play/PlayGameHeader";
import { usePlayWorldcup01F } from "@/features/play/worldcup/PLAY_WORLDCUP_01F";
import type { Place } from "@/types/place";

export default function PLAY_WORLDCUP_01() {
  const {
    places,
    isLoading,
    selectedIds,
    phase,
    currentMatch,
    champion,
    roundLabel,
    statusMessage,
    TogglePlace,
    HandleStart,
    HandlePickWinner,
    HandleReset,
  } = usePlayWorldcup01F();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-amber-50/40">
      <PlayGameHeader
        emoji="🏆"
        title="장소 월드컵"
        subtitle="저장한 맛집으로 토너먼트를 열고 진짜 표심을 확인해 보세요!"
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
          </div>
        ) : phase === "setup" ? (
          <SetupView
            places={places}
            selectedIds={selectedIds}
            statusMessage={statusMessage}
            onToggle={TogglePlace}
            onStart={HandleStart}
          />
        ) : phase === "playing" && currentMatch ? (
          <MatchupView
            roundLabel={roundLabel}
            match={currentMatch}
            statusMessage={statusMessage}
            onPick={HandlePickWinner}
          />
        ) : champion ? (
          <ChampionView champion={champion} onReset={HandleReset} />
        ) : (
          <p className="py-10 text-center text-sm text-gray-500">
            후보가 부족합니다. 맛집을 더 저장해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}

function SetupView({
  places,
  selectedIds,
  statusMessage,
  onToggle,
  onStart,
}: {
  places: Place[];
  selectedIds: Set<number>;
  statusMessage: string | null;
  onToggle: (id: number) => void;
  onStart: () => void;
}) {
  if (places.length < 2) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-600">
          월드컵을 열려면 저장된 맛집이 2곳 이상 필요해요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        토너먼트에 넣을 맛집을 선택하세요 ({selectedIds.size}곳 선택)
      </p>
      <ul className="space-y-2">
        {places.map((place) => {
          const isSelected = selectedIds.has(place.id);
          return (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => onToggle(place.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 bg-white"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {place.place_name}
                </p>
                {place.category && (
                  <p className="mt-0.5 text-xs text-gray-500">{place.category}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {statusMessage && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {statusMessage}
        </p>
      )}
      <button
        type="button"
        onClick={onStart}
        className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
      >
        토너먼트 시작 🚀
      </button>
    </div>
  );
}

function MatchupView({
  roundLabel,
  match,
  statusMessage,
  onPick,
}: {
  roundLabel: string;
  match: [Place, Place];
  statusMessage: string | null;
  onPick: (place: Place) => void;
}) {
  const [left, right] = match;

  return (
    <div className="space-y-4">
      <p className="text-center text-xs font-semibold text-amber-700">
        {roundLabel} · 더 가고 싶은 곳을 터치!
      </p>
      {statusMessage && (
        <p className="rounded-xl bg-amber-100 px-3 py-2 text-center text-xs text-amber-800">
          {statusMessage}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {[left, right].map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => onPick(place)}
            className="flex min-h-36 flex-col justify-between rounded-2xl border-2 border-gray-100 bg-white p-4 text-left shadow-sm transition-transform active:scale-95 hover:border-primary"
          >
            <span className="text-2xl" aria-hidden>
              🍽️
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">{place.place_name}</p>
              {place.category && (
                <p className="mt-1 text-[11px] text-gray-500">{place.category}</p>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-400">VS</p>
    </div>
  );
}

function ChampionView({
  champion,
  onReset,
}: {
  champion: Place;
  onReset: () => void;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-100 to-orange-50 p-6 text-center shadow-sm ring-1 ring-amber-200">
      <Trophy className="mx-auto h-10 w-10 text-amber-500" aria-hidden />
      <p className="mt-3 text-xs font-semibold text-amber-700">우승 맛집</p>
      <h2 className="mt-2 text-2xl font-bold text-gray-900">{champion.place_name}</h2>
      {champion.address && (
        <p className="mt-2 text-xs text-gray-600">{champion.address}</p>
      )}
      <button
        type="button"
        onClick={onReset}
        className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
      >
        다시 하기
      </button>
    </div>
  );
}
