"use client";

import Link from "next/link";
import { BadgeCheck, ChevronRight, ExternalLink, MapPin, X } from "lucide-react";
import type { Place } from "@/types/place";

type HomePlaceSheet01Props = {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function HOME_PLACE_SHEET_01({
  place,
  isOpen,
  onClose,
}: HomePlaceSheet01Props) {
  if (!isOpen || !place) {
    return null;
  }

  const visited = Boolean(place.visited);
  const receiptVerified = Boolean(place.receipt_verified);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-place-sheet-title"
        className="relative z-10 mx-auto w-full max-w-md animate-slide-up rounded-t-3xl bg-white shadow-2xl"
      >
        <div className="px-4 pt-3">
          <div className="mx-auto h-1 w-12 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="home-place-sheet-title"
                  className="text-lg font-bold text-gray-900"
                >
                  {place.place_name}
                </h2>
                {receiptVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <BadgeCheck className="h-2.5 w-2.5" aria-hidden />
                    찐맛집
                  </span>
                )}
                {visited && !receiptVerified && (
                  <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    발도장
                  </span>
                )}
                {!visited && !receiptVerified && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    미방문
                  </span>
                )}
              </div>

              {place.category && (
                <p className="mt-1 text-xs text-gray-400">{place.category}</p>
              )}
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

          {place.address && (
            <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="break-words">{place.address}</span>
            </p>
          )}

          {place.memo && (
            <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {place.memo}
            </p>
          )}

          {place.tags.length > 0 && (
            <p className="mt-3 text-xs font-medium text-primary">
              {place.tags.join(" ")}
            </p>
          )}

          {place.link_url && (
            <a
              href={place.link_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              원본 링크 보기
            </a>
          )}

          <Link
            href={`/places/${place.id}`}
            onClick={onClose}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-semibold text-white"
          >
            상세 · 타임라인 보기
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
