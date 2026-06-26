"use client";

import { Link2, Loader2, Plus, Tag, X } from "lucide-react";
import FolderSelectField from "@/components/features/FolderSelectField";
import ReceiptVerifyButton from "@/components/features/ReceiptVerifyButton";
import type { Place, PlaceFormData } from "@/types/place";
import type { Folder } from "@/types/folder";

type HomeRegister01Props = {
  isOpen: boolean;
  onClose: () => void;
  form: PlaceFormData;
  customTag: string;
  setCustomTag: (value: string) => void;
  isScraping: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  statusMessage: string | null;
  presetTags: string[];
  folders: Folder[];
  isLoadingFolders: boolean;
  lastSavedPlace: Place | null;
  UpdateField: <K extends keyof PlaceFormData>(
    key: K,
    value: PlaceFormData[K],
  ) => void;
  ToggleTag: (tag: string) => void;
  AddCustomTag: () => void;
  HandleScrapeLink: () => void;
  HandleSavePlace: () => void;
  HandleFolderCreated: (folder: Folder) => void;
  HandleReceiptVerified: (place: Place) => void;
};

export default function HOME_REGISTER_01({
  isOpen,
  onClose,
  form,
  customTag,
  setCustomTag,
  isScraping,
  isSaving,
  errorMessage,
  statusMessage,
  presetTags,
  folders,
  isLoadingFolders,
  lastSavedPlace,
  UpdateField,
  ToggleTag,
  AddCustomTag,
  HandleScrapeLink,
  HandleSavePlace,
  HandleFolderCreated,
  HandleReceiptVerified,
}: HomeRegister01Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-sheet-title"
        className="relative z-10 mx-auto flex max-h-[min(88dvh,720px)] w-full max-w-md animate-slide-up flex-col rounded-t-3xl bg-white shadow-2xl"
      >
        <div className="shrink-0 cursor-grab px-4 pt-3 active:cursor-grabbing">
          <div className="mx-auto h-1 w-12 rounded-full bg-gray-300" />
        </div>

        <div className="shrink-0 border-b border-gray-100 px-5 pb-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="register-sheet-title"
                className="text-base font-bold text-gray-900"
              >
                맛집 등록
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                링크를 붙여넣으면 자동으로 채워져요
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3 pb-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                링크
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.link_url}
                  onChange={(event) =>
                    UpdateField("link_url", event.target.value)
                  }
                  placeholder="https://..."
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  disabled={isScraping || !form.link_url.trim()}
                  onClick={() => void HandleScrapeLink()}
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isScraping ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Link2 className="h-4 w-4" aria-hidden />
                  )}
                  불러오기
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                맛집 이름
              </label>
              <input
                value={form.place_name}
                onChange={(event) =>
                  UpdateField("place_name", event.target.value)
                }
                placeholder="가게 이름"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                주소
              </label>
              <input
                value={form.address}
                onChange={(event) => UpdateField("address", event.target.value)}
                placeholder="주소"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  위도
                </label>
                <input
                  value={form.latitude}
                  onChange={(event) =>
                    UpdateField("latitude", event.target.value)
                  }
                  placeholder="35.1234"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  경도
                </label>
                <input
                  value={form.longitude}
                  onChange={(event) =>
                    UpdateField("longitude", event.target.value)
                  }
                  placeholder="129.1234"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                카테고리
              </label>
              <input
                value={form.category}
                onChange={(event) => UpdateField("category", event.target.value)}
                placeholder="한식, 카페 등"
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

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                메모
              </label>
              <textarea
                value={form.memo}
                onChange={(event) => UpdateField("memo", event.target.value)}
                rows={2}
                placeholder="기억하고 싶은 내용"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
                <Tag className="h-3.5 w-3.5" aria-hidden />
                커스텀 태그
              </label>
              <div className="flex flex-wrap gap-2">
                {presetTags.map((tag) => {
                  const isSelected = form.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => ToggleTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={customTag}
                  onChange={(event) => setCustomTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      AddCustomTag();
                    }
                  }}
                  placeholder="#직접입력"
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white"
                />
                <button
                  type="button"
                  onClick={AddCustomTag}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  추가
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="whitespace-pre-wrap rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            {statusMessage && (
              <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
                {statusMessage}
              </p>
            )}

            <button
              type="button"
              disabled={isSaving || !form.place_name.trim()}
              onClick={() => void HandleSavePlace()}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "맛집 저장하기"}
            </button>

            {lastSavedPlace && (
              <ReceiptVerifyButton
                placeId={lastSavedPlace.id}
                placeName={lastSavedPlace.place_name}
                receiptVerified={lastSavedPlace.receipt_verified}
                onVerified={(place) => HandleReceiptVerified(place)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
