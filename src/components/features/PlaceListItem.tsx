"use client";

import Link from "next/link";
import { BadgeCheck, ChevronRight, Folder, Loader2, Trash2 } from "lucide-react";
import type { Place } from "@/types/place";

type PlaceListItemProps = {
  place: Place;
  folderName?: string;
  isToggling?: boolean;
  isDeleting?: boolean;
  trailing?: React.ReactNode;
  onToggleVisit: (place: Place) => void;
  onDelete?: (place: Place) => void;
};

export default function PlaceListItem({
  place,
  folderName,
  isToggling = false,
  isDeleting = false,
  trailing,
  onToggleVisit,
  onDelete,
}: PlaceListItemProps) {
  const visited = Boolean(place.visited);
  const receiptVerified = Boolean(place.receipt_verified);

  return (
    <article
      className={`rounded-2xl border p-4 transition-colors ${
        receiptVerified
          ? "border-amber-200 bg-amber-50/50"
          : visited
            ? "border-green-200 bg-green-50/60"
            : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/places/${place.id}`}
              className="font-semibold text-gray-900 hover:text-primary"
            >
              {place.place_name}
            </Link>
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
          </div>
          {place.category && (
            <p className="mt-1 text-xs text-gray-400">{place.category}</p>
          )}
          {folderName && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <Folder className="h-3 w-3" aria-hidden />
              {folderName}
            </p>
          )}
          {place.address && (
            <p className="mt-2 text-sm break-words text-gray-500">
              {place.address}
            </p>
          )}
          {place.memo && (
            <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {place.memo}
            </p>
          )}
          {place.tags.length > 0 && (
            <p className="mt-2 text-xs text-primary">{place.tags.join(" ")}</p>
          )}
          <Link
            href={`/places/${place.id}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            방문 타임라인 · 메모 보기
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="flex shrink-0 items-start gap-1">
          {onDelete && (
            <button
              type="button"
              disabled={isDeleting || isToggling}
              onClick={() => onDelete(place)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              aria-label={`${place.place_name} 삭제`}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
            </button>
          )}
          {trailing}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          disabled={isToggling || isDeleting}
          onClick={() => onToggleVisit(place)}
          className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
            visited
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {isToggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          {visited ? "방문 취소" : "방문 완료! 🐾"}
        </button>
      </div>
    </article>
  );
}
