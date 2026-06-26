"use client";

import { Bomb, Loader2, Plus, X } from "lucide-react";
import PlayGameHeader from "@/components/play/PlayGameHeader";
import { usePlayBombRoulette01F } from "@/features/play/roulette/PLAY_BOMB_ROULETTE_01F";

export default function PLAY_BOMB_ROULETTE_01() {
  const {
    participants,
    newName,
    setNewName,
    displayName,
    victim,
    isSpinning,
    statusMessage,
    AddParticipant,
    RemoveParticipant,
    HandleSpin,
  } = usePlayBombRoulette01F();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-rose-50/40">
      <PlayGameHeader
        emoji="💣"
        title="밥값 독박 폭탄 룰렛"
        subtitle="오늘 밥값·2차 담당자를 유쾌하게 정하는 복불복 게임!"
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-medium text-gray-500">참가자</p>
          <div className="flex flex-wrap gap-2">
            {participants.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
              >
                {name}
                <button
                  type="button"
                  onClick={() => RemoveParticipant(name)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={`${name} 제거`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  AddParticipant();
                }
              }}
              placeholder="이름 추가"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white"
            />
            <button
              type="button"
              onClick={AddParticipant}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              추가
            </button>
          </div>
        </section>

        <div className="mt-5 rounded-3xl bg-gradient-to-br from-rose-100 to-red-50 p-6 text-center shadow-sm">
          <p className="text-xs font-semibold text-rose-600">
            {isSpinning ? "폭탄이 돌아가는 중..." : "독박 당첨자"}
          </p>
          <p
            className={`mt-4 text-2xl font-bold text-gray-900 ${
              isSpinning ? "animate-pulse" : ""
            }`}
          >
            {displayName || "룰렛을 돌려보세요"}
          </p>
          {victim && !isSpinning && (
            <p className="mt-3 text-sm font-medium text-rose-700">
              💸 {victim}님이 오늘의 독박 투커!
            </p>
          )}
        </div>

        {statusMessage && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {statusMessage}
          </p>
        )}

        <button
          type="button"
          disabled={isSpinning}
          onClick={HandleSpin}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSpinning ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Bomb className="h-4 w-4" aria-hidden />
          )}
          {isSpinning ? "추첨 중..." : "폭탄 돌리기 💣"}
        </button>
      </main>
    </div>
  );
}
