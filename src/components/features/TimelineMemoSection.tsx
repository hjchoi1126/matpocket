"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, MessageSquarePlus, Trash2 } from "lucide-react";
import {
  AddTimelineMemoLogic1,
  DeleteTimelineMemoLogic1,
  FormatTimelineDate,
  LoadTimelineMemosLogic1,
} from "@/features/places/TimelineMemoLogic1";
import type { PlaceTimelineMemo } from "@/types/timeline";

type TimelineMemoSectionProps = {
  placeId: number;
};

export default function TimelineMemoSection({
  placeId,
}: TimelineMemoSectionProps) {
  const [memos, setMemos] = useState<PlaceTimelineMemo[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMemoId, setDeletingMemoId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const LoadMemos = useCallback(async () => {
    setIsLoading(true);
    const result = await LoadTimelineMemosLogic1(placeId);
    setMemos(result.memos);
    setErrorMessage(result.error ?? null);
    setIsLoading(false);
  }, [placeId]);

  useEffect(() => {
    void LoadMemos();
  }, [LoadMemos]);

  const HandleAddMemo = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const result = await AddTimelineMemoLogic1(placeId, draft);
    setIsSaving(false);

    if (result.error || !result.memo) {
      setErrorMessage(result.error ?? "메모 저장에 실패했습니다.");
      return;
    }

    setDraft("");
    setMemos((prev) => [result.memo!, ...prev]);
  };

  const HandleDeleteMemo = async (memoId: number) => {
    setDeletingMemoId(memoId);
    setErrorMessage(null);

    const result = await DeleteTimelineMemoLogic1(memoId, placeId);
    setDeletingMemoId(null);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setMemos((prev) => prev.filter((memo) => memo.id !== memoId));
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-base font-semibold text-gray-900">
          내가 갈 때마다 기록하는 타임라인 메모
        </h2>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        방문할 때마다 웨이팅, 추천 메뉴, 동행자 반응 등을 남겨 두세요.
      </p>

      <div className="mb-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void HandleAddMemo();
            }
          }}
          placeholder="예: 주말 웨이팅 40분 있음"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
        />
        <button
          type="button"
          disabled={isSaving || !draft.trim()}
          onClick={() => void HandleAddMemo()}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
          )}
          추가
        </button>
      </div>

      {errorMessage && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : memos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-400">아직 기록된 메모가 없습니다.</p>
        </div>
      ) : (
        <ol className="relative border-l-2 border-primary/20 pl-4">
          {memos.map((memo, index) => (
            <li key={memo.id} className={`relative ${index > 0 ? "mt-4" : ""}`}>
              <span className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary shadow-sm" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-primary">
                  {FormatTimelineDate(memo.created_at)}
                </p>
                <button
                  type="button"
                  disabled={deletingMemoId === memo.id}
                  onClick={() => void HandleDeleteMemo(memo.id)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label="메모 삭제"
                >
                  {deletingMemoId === memo.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              </div>
              <p className="mt-1 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {memo.content}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
