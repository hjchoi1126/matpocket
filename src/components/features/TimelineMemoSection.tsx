"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Clock,
  ImagePlus,
  Loader2,
  MessageSquarePlus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
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

type DraftPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export default function TimelineMemoSection({
  placeId,
}: TimelineMemoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [memos, setMemos] = useState<PlaceTimelineMemo[]>([]);
  const [draft, setDraft] = useState("");
  const [draftPhotos, setDraftPhotos] = useState<DraftPhoto[]>([]);
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

  useEffect(() => {
    return () => {
      draftPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [draftPhotos]);

  const HandleSelectPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = 5 - draftPhotos.length;

    if (remainingSlots <= 0) {
      setErrorMessage("사진은 최대 5장까지 올릴 수 있어요.");
      return;
    }

    const nextPhotos = selectedFiles.slice(0, remainingSlots).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setDraftPhotos((prev) => [...prev, ...nextPhotos]);
    setErrorMessage(null);
  };

  const HandleRemoveDraftPhoto = (photoId: string) => {
    setDraftPhotos((prev) => {
      const target = prev.find((photo) => photo.id === photoId);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  const ResetDraft = () => {
    setDraft("");
    setDraftPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      return [];
    });
  };

  const HandleAddMemo = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const result = await AddTimelineMemoLogic1(
      placeId,
      draft,
      draftPhotos.map((photo) => photo.file),
    );
    setIsSaving(false);

    if (result.error || !result.memo) {
      setErrorMessage(result.error ?? "메모 저장에 실패했습니다.");
      return;
    }

    ResetDraft();
    setMemos((prev) => [result.memo!, ...prev]);
  };

  const HandleDeleteMemo = async (memo: PlaceTimelineMemo) => {
    setDeletingMemoId(memo.id);
    setErrorMessage(null);

    const result = await DeleteTimelineMemoLogic1(
      memo.id,
      placeId,
      memo.image_urls,
    );
    setDeletingMemoId(null);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setMemos((prev) => prev.filter((item) => item.id !== memo.id));
  };

  const canSubmit = draft.trim().length > 0 || draftPhotos.length > 0;
  const photoCount = memos.reduce(
    (count, memo) => count + memo.image_urls.length,
    0,
  );

  return (
    <section className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-white to-amber-50/80 shadow-md ring-1 ring-primary/10">
      <div className="border-b border-primary/10 bg-white/70 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <Clock className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                방문 타임라인
              </h2>
              {!isLoading && memos.length > 0 && (
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {memos.length}회 기록
                </span>
              )}
              {!isLoading && photoCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  <Camera className="h-3 w-3" aria-hidden />
                  사진 {photoCount}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              갈 때마다 웨이팅, 메뉴 후기, 음식 사진을 쌓아 두세요.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-2xl border border-primary/15 bg-white p-3 shadow-sm">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            오늘 방문 기록 남기기
          </p>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder="예: 주말 웨이팅 40분, 삼겹살 진짜 맛있음"
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden />
              음식 사진
            </button>
            <button
              type="button"
              disabled={isSaving || !canSubmit}
              onClick={() => void HandleAddMemo()}
              className="inline-flex flex-[1.4] items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
              )}
              기록 추가
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="hidden"
          onChange={HandleSelectPhotos}
        />

        {draftPhotos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {draftPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white shadow-md"
              >
                <img
                  src={photo.previewUrl}
                  alt="업로드 예정 사진"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => HandleRemoveDraftPhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white"
                  aria-label="선택한 사진 제거"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}

        {errorMessage && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            {errorMessage}
          </p>
        )}

        {isLoading ? (
          <p className="py-8 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : memos.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-primary/25 bg-white/80 py-10 text-center">
            <Camera className="mx-auto h-8 w-8 text-primary/40" aria-hidden />
            <p className="mt-3 text-sm font-medium text-gray-700">
              아직 방문 기록이 없어요
            </p>
            <p className="mt-1 text-xs text-gray-500">
              첫 방문 메모나 음식 사진을 남겨 보세요.
            </p>
          </div>
        ) : (
          <ol className="relative mt-5 space-y-4 border-l-2 border-primary/30 pl-5">
            {memos.map((memo) => (
              <li key={memo.id} className="relative">
                <span className="absolute -left-[26px] top-4 h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow-sm" />
                <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-50 px-3 py-2.5">
                    <p className="text-xs font-bold text-primary">
                      {FormatTimelineDate(memo.created_at)}
                    </p>
                    <button
                      type="button"
                      disabled={deletingMemoId === memo.id}
                      onClick={() => void HandleDeleteMemo(memo)}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      aria-label="메모 삭제"
                    >
                      {deletingMemoId === memo.id ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </button>
                  </div>

                  {memo.image_urls.length > 0 && (
                    <div
                      className={
                        memo.image_urls.length === 1
                          ? "p-2"
                          : "grid grid-cols-2 gap-2 p-2"
                      }
                    >
                      {memo.image_urls.map((imageUrl) => (
                        <a
                          key={imageUrl}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-xl"
                        >
                          <img
                            src={imageUrl}
                            alt="타임라인 음식 사진"
                            className={`w-full object-cover ${
                              memo.image_urls.length === 1
                                ? "aspect-[4/3] max-h-56"
                                : "aspect-square"
                            }`}
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {memo.content.trim() && (
                    <p className="px-3 py-3 text-sm leading-relaxed text-gray-700">
                      {memo.content}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
