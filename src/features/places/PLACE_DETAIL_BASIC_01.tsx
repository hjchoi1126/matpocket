"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  MapPin,
} from "lucide-react";
import ReceiptVerifyButton from "@/components/features/ReceiptVerifyButton";
import FolderSelectField from "@/components/features/FolderSelectField";
import TimelineMemoSection from "@/components/features/TimelineMemoSection";
import { usePlaceDetailBasic01F } from "@/features/places/PLACE_DETAIL_BASIC_01F";

type PlaceDetailBasic01Props = {
  placeId: number;
};

export default function PLACE_DETAIL_BASIC_01({
  placeId,
}: PlaceDetailBasic01Props) {
  const {
    place,
    form,
    isLoading,
    isSaving,
    isTogglingVisit,
    errorMessage,
    statusMessage,
    UpdateField,
    HandleSave,
    HandleToggleVisit,
    HandleReceiptVerified,
    folders,
    isLoadingFolders,
    HandleFolderCreated,
  } = usePlaceDetailBasic01F(placeId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm text-gray-500">
          {errorMessage ?? "맛집을 찾을 수 없습니다."}
        </p>
        <Link href="/saved" className="mt-3 text-sm font-medium text-primary">
          저장소로 돌아가기
        </Link>
      </div>
    );
  }

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
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-gray-900">
                {place.place_name}
              </h1>
              {place.receipt_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                  영수증 인증된 찐맛집
                </span>
              )}
              {place.visited && !place.receipt_verified && (
                <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  발도장
                </span>
              )}
            </div>
            {place.address && (
              <p className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                {place.address}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">맛집 수정</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                맛집 이름
              </label>
              <input
                value={form.place_name}
                onChange={(event) =>
                  UpdateField("place_name", event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                주소
              </label>
              <input
                value={form.address}
                onChange={(event) => UpdateField("address", event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                카테고리
              </label>
              <input
                value={form.category}
                onChange={(event) => UpdateField("category", event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                한 줄 메모
              </label>
              <textarea
                value={form.memo}
                onChange={(event) => UpdateField("memo", event.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <FolderSelectField
              folders={folders}
              value={form.folder_id}
              isLoading={isLoadingFolders}
              onChange={(folderId) => UpdateField("folder_id", folderId)}
              onFolderCreated={HandleFolderCreated}
            />
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void HandleSave()}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "수정 저장하기"}
            </button>
          </div>
        </section>

        <div className="mb-4">
          <ReceiptVerifyButton
            placeId={place.id}
            placeName={place.place_name}
            receiptVerified={place.receipt_verified}
            onVerified={(updatedPlace) => HandleReceiptVerified(updatedPlace)}
          />
        </div>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            disabled={isTogglingVisit}
            onClick={() => void HandleToggleVisit()}
            className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50 ${
              place.visited
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isTogglingVisit && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            )}
            {place.visited ? "방문 취소" : "방문 완료! 🐾"}
          </button>
        </div>

        <TimelineMemoSection placeId={place.id} />

        {statusMessage && (
          <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </main>
    </div>
  );
}
