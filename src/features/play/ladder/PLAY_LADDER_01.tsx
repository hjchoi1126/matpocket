"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import PlayGameHeader from "@/components/play/PlayGameHeader";
import { usePlayLadder01F } from "@/features/play/ladder/PLAY_LADDER_01F";

export default function PLAY_LADDER_01() {
  const {
    participants,
    newName,
    setNewName,
    ladderResults,
    newResult,
    setNewResult,
    phase,
    matrix,
    bottomResults,
    columnCount,
    outcomes,
    statusMessage,
    AddParticipant,
    RemoveParticipant,
    UpdateResult,
    RemoveResult,
    AddResult,
    HandleGenerate,
    HandleBuildLadder,
    HandleBackToSetup,
    HandleReveal,
    HandleReset,
  } = usePlayLadder01F();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-sky-50/40">
      <PlayGameHeader
        emoji="🪜"
        title="사다리 타기"
        subtitle="참가자와 결과 항목을 정한 뒤, 사다리로 당첨자를 뽑아보세요."
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

        {phase === "results" && (
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-semibold text-gray-900">
                결과 항목 설정
              </p>
              <p className="mb-3 text-xs text-gray-500">
                사다리 아래에 나올 결과를 수정·추가·삭제할 수 있어요.
              </p>
              <ul className="space-y-2">
                {ladderResults.map((result, index) => (
                  <li key={`result-${index}`} className="flex gap-2">
                    <input
                      value={result}
                      onChange={(event) =>
                        UpdateResult(index, event.target.value)
                      }
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => RemoveResult(index)}
                      disabled={ladderResults.length <= 1}
                      aria-label={`${result} 삭제`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-gray-500 disabled:opacity-40"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={newResult}
                  onChange={(event) => setNewResult(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      AddResult();
                    }
                  }}
                  placeholder="새 결과 추가 (예: 디저트 담당)"
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white"
                />
                <button
                  type="button"
                  onClick={AddResult}
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={HandleBackToSetup}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                이전
              </button>
              <button
                type="button"
                onClick={HandleBuildLadder}
                className="flex-[2] rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
              >
                사다리 완성하기 🪜
              </button>
            </div>
          </div>
        )}

        {(phase === "ready" || phase === "result") && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
              <div
                className="grid min-w-max"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, minmax(3.5rem, 1fr))`,
                }}
              >
                {Array.from({ length: columnCount }, (_, index) => (
                  <div
                    key={`name-${index}`}
                    className="flex flex-col items-center px-1 pb-2 text-center"
                  >
                    <p className="truncate text-[11px] font-semibold text-gray-900">
                      {participants[index] ?? ""}
                    </p>
                    {participants[index] ? (
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    ) : (
                      <div className="mt-1 h-2.5 w-2.5 shrink-0" aria-hidden />
                    )}
                  </div>
                ))}

                <div
                  className="relative col-span-full h-48"
                  style={{
                    gridColumn: `1 / span ${columnCount}`,
                    display: "grid",
                    gridTemplateColumns: `repeat(${columnCount}, minmax(3.5rem, 1fr))`,
                  }}
                >
                  {Array.from({ length: columnCount }, (_, index) => (
                    <div key={`rail-${index}`} className="relative h-full">
                      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-gray-300" />
                    </div>
                  ))}

                  {matrix.map((bridges, rowIndex) => (
                    <div
                      key={`row-${rowIndex}`}
                      className="pointer-events-none absolute inset-x-0 grid"
                      style={{
                        top: `${((rowIndex + 1) / (matrix.length + 1)) * 100}%`,
                        gridTemplateColumns: `repeat(${columnCount}, minmax(3.5rem, 1fr))`,
                        transform: "translateY(-50%)",
                      }}
                    >
                      {bridges.map((hasBridge, bridgeIndex) => (
                        <div
                          key={`bridge-${rowIndex}-${bridgeIndex}`}
                          className="relative h-0"
                        >
                          {hasBridge && (
                            <div className="absolute top-0 left-1/2 z-10 h-0.5 w-full -translate-y-1/2 bg-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {bottomResults.map((result, index) => (
                  <div key={`bottom-${index}`} className="px-1 pt-2 text-center">
                    <p className="rounded-lg bg-sky-50 px-1 py-2 text-[10px] font-semibold text-sky-800">
                      {result || "—"}
                    </p>
                  </div>
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
