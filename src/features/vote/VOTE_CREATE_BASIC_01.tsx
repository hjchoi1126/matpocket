"use client";

import Link from "next/link";
import { ArrowLeft, Check, Loader2, Users } from "lucide-react";
import { useVoteCreateBasic01F } from "@/features/vote/VOTE_CREATE_BASIC_01F";

export default function VOTE_CREATE_BASIC_01() {
  const {
    places,
    selectedIds,
    title,
    setTitle,
    isLoading,
    isCreating,
    errorMessage,
    TogglePlace,
    HandleCreateVote,
  } = useVoteCreateBasic01F();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/saved"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">그룹 투표 만들기</h1>
            <p className="text-xs text-gray-500">후보 맛집을 고르고 링크를 공유하세요</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            투표 제목
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-white bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary"
          />
        </section>

        <p className="mb-3 flex items-center gap-1 text-sm font-semibold text-gray-900">
          <Users className="h-4 w-4 text-primary" aria-hidden />
          후보 맛집 선택 ({selectedIds.size}곳)
        </p>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
            <p className="text-sm text-gray-500">저장된 맛집이 없습니다.</p>
            <Link href="/" className="mt-2 inline-block text-sm font-medium text-primary">
              맛집 먼저 저장하기
            </Link>
          </div>
        ) : (
          <ul className="space-y-2 pb-24">
            {places.map((place) => {
              const isSelected = selectedIds.has(place.id);
              return (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => TogglePlace(place.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-gray-900">
                        {place.place_name}
                      </span>
                      {place.address && (
                        <span className="mt-1 block text-xs text-gray-500">
                          {place.address}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {errorMessage && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </main>

      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 [padding-bottom:env(safe-area-inset-bottom)]">
        <button
          type="button"
          disabled={isCreating || selectedIds.size < 2}
          onClick={() => void HandleCreateVote()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          투표방 만들기
        </button>
      </div>
    </div>
  );
}
