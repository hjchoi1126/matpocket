"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { FormatDateKeyLogic1 } from "@/features/calendar/CalendarGridLogic1";
import type { Place } from "@/types/place";

type CalendarEventSheet01Props = {
  isOpen: boolean;
  selectedDate: Date;
  places: Place[];
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (input: {
    place_id: number;
    title: string;
    memo: string;
    starts_at: string;
  }) => void;
};

export default function CALENDAR_EVENT_SHEET_01({
  isOpen,
  selectedDate,
  places,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: CalendarEventSheet01Props) {
  const [placeId, setPlaceId] = useState("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("19:00");
  const [memo, setMemo] = useState("");

  if (!isOpen) {
    return null;
  }

  const dateValue = FormatDateKeyLogic1(selectedDate);

  const HandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPlaceId = Number(placeId);
    const trimmedTitle = title.trim();

    if (!parsedPlaceId || Number.isNaN(parsedPlaceId) || !trimmedTitle) {
      return;
    }

    const startsAt = new Date(`${dateValue}T${time}:00`);

    onSubmit({
      place_id: parsedPlaceId,
      title: trimmedTitle,
      memo: memo.trim(),
      starts_at: startsAt.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <form
        onSubmit={HandleSubmit}
        className="relative z-10 mx-auto flex max-h-[min(85dvh,680px)] w-full max-w-md animate-slide-up flex-col rounded-t-3xl bg-white shadow-2xl"
      >
        <div className="shrink-0 px-4 pt-3">
          <div className="mx-auto h-1 w-12 rounded-full bg-gray-300" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">맛집 약속 등록</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
            aria-label="바텀 시트 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                맛집 선택
              </label>
              <select
                name="place_id"
                required
                value={placeId}
                onChange={(event) => {
                  const nextPlaceId = event.target.value;
                  setPlaceId(nextPlaceId);
                  const place = places.find(
                    (item) => item.id === Number(nextPlaceId),
                  );
                  if (place && !title.trim()) {
                    setTitle(place.place_name);
                  }
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              >
                <option value="" disabled>
                  저장된 맛집을 선택하세요
                </option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.place_name}
                  </option>
                ))}
              </select>
              {places.length === 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  선택한 폴더에 맛집이 없습니다. 먼저 맛집을 저장해 주세요.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                일정 제목
              </label>
              <input
                name="title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 팀 회식, 데이트 저녁"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                시간
              </label>
              <input
                name="time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                메모 (선택)
              </label>
              <textarea
                name="memo"
                rows={2}
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="예: 7시 30분까지 모이기, 예약자 홍길동"
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving || places.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              일정 등록하기
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
