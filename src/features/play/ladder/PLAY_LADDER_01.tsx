"use client";

import { Plus, X } from "lucide-react";
import PlayGameHeader from "@/components/play/PlayGameHeader";
import { usePlayLadder01F } from "@/features/play/ladder/PLAY_LADDER_01F";

export default function PLAY_LADDER_01() {
  const {
    participants,
    newName,
    setNewName,
    phase,
    matrix,
    bottomResults,
    outcomes,
    statusMessage,
    AddParticipant,
    RemoveParticipant,
    HandleGenerate,
    HandleReveal,
    HandleReset,
  } = usePlayLadder01F();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-sky-50/40">
      <PlayGameHeader
        emoji="🪜"
        title="2차 영수증 사다리타기"
        subtitle="독박부터 면제까지! 더치페이 복불복을 사다리로 정해요."
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {phase === "setup" && (
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium text-gray-500">
                참가자 (최대 8명)
              </p>
              <div className="flex flex-wrap gap-2">
                {participants.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => RemoveParticipant(name)}
                      aria-label={`${name} 제거`}
                    >
                      <X className="h-3 w-3 text-gray-400" />
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
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  추가
                </button>
              </div>
            </section>
            {statusMessage && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {statusMessage}
              </p>
            )}
            <button
              type="button"
              onClick={HandleGenerate}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
            >
              사다리 만들기 🪜
            </button>
          </div>
        )}

        {(phase === "ready" || phase === "result") && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
              <div
                className="grid min-w-max gap-0"
                style={{
                  gridTemplateColumns: `repeat(${participants.length}, minmax(3.5rem, 1fr))`,
                }}
              >
                {participants.map((name) => (
                  <div key={name} className="px-1 text-center">
                    <p className="truncate text-[11px] font-semibold text-gray-900">
                      {name}
                    </p>
                    <div className="mx-auto mt-2 h-3 w-3 rounded-full bg-primary" />
                    <div className="mx-auto mt-1 h-40 w-0.5 bg-gray-300" />
                  </div>
                ))}
              </div>

              <div className="relative mt-1 h-40">
                {matrix.map((bridges, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className="absolute inset-x-0 grid"
                    style={{
                      top: `${(rowIndex / Math.max(matrix.length, 1)) * 100}%`,
                      gridTemplateColumns: `repeat(${participants.length}, minmax(3.5rem, 1fr))`,
                    }}
                  >
                    {bridges.map((hasBridge, bridgeIndex) => (
                      <div
                        key={`bridge-${rowIndex}-${bridgeIndex}`}
                        className="relative h-3"
                      >
                        {hasBridge && (
                          <div className="absolute top-1/2 right-0 left-1/2 h-0.5 -translate-y-1/2 bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div
                className="mt-2 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${participants.length}, minmax(3.5rem, 1fr))`,
                }}
              >
                {bottomResults.map((result, index) => (
                  <p
                    key={`result-${index}`}
                    className="rounded-lg bg-sky-50 px-1 py-2 text-center text-[10px] font-semibold text-sky-800"
                  >
                    {result}
                  </p>
                ))}
              </div>
            </div>

            {phase === "ready" && (
              <button
                type="button"
                onClick={HandleReveal}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white"
              >
                결과 확인하기 🎲
              </button>
            )}

            {phase === "result" && (
              <ul className="space-y-2">
                {outcomes.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
                  >
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="font-medium text-primary">{item.result}</span>
                  </li>
                ))}
                <button
                  type="button"
                  onClick={HandleReset}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700"
                >
                  다시 하기
                </button>
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
