"use client";

import Link from "next/link";
import { Folder, Loader2, MapPin, Plus, Search, Tag, Users, X } from "lucide-react";
import PlaceListItem from "@/components/features/PlaceListItem";
import SharedFolderPanel from "@/components/features/SharedFolderPanel";
import MainHeaderActions from "@/components/layout/MainHeaderActions";
import { useSharedBasic01F } from "@/features/shared/SHARED_BASIC_01F";
import type { FolderFilter } from "@/types/folder";

export default function SHARED_BASIC_01() {
  const {
    sharedFolders,
    sharedPlaces,
    isLoading,
    errorMessage,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedFolder,
    setSelectedFolder,
    visitFilter,
    setVisitFilter,
    togglingPlaceId,
    deletingPlaceId,
    sharedFolderName,
    setSharedFolderName,
    isCreatingSharedFolder,
    statusMessage,
    selectedFolderInfo,
    folderNameMap,
    folderCounts,
    allTags,
    filteredPlaces,
    HandleSharedFolderChanged,
    HandleToggleVisit,
    HandleDeletePlace,
    HandleCreateSharedFolder,
    HandleResetFilters,
  } = useSharedBasic01F();

  const hasActiveFilters =
    selectedFolder !== "all" ||
    selectedTag !== null ||
    visitFilter !== "all" ||
    searchQuery.trim().length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Users className="h-5 w-5 shrink-0 text-violet-600" aria-hidden />
            <h1 className="truncate text-lg font-bold text-gray-900">공유저장소</h1>
          </div>
          <MainHeaderActions />
        </div>

        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="맛집 이름, 주소, 태그, 메모 검색"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-10 text-sm outline-none focus:border-violet-400 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="mb-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Users className="h-4 w-4 text-violet-600" aria-hidden />
            공동 폴더 만들기
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            친구와 함께 편집할 맛집 리스트를 만들고 초대 링크를 공유하세요.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={sharedFolderName}
              onChange={(event) => setSharedFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void HandleCreateSharedFolder();
                }
              }}
              placeholder="예: 커플 맛집, 팀 회식 후보"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            />
            <button
              type="button"
              disabled={isCreatingSharedFolder || !sharedFolderName.trim()}
              onClick={() => void HandleCreateSharedFolder()}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isCreatingSharedFolder ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-3.5 w-3.5" aria-hidden />
              )}
              만들기
            </button>
          </div>
        </section>

        {selectedFolderInfo && (
          <SharedFolderPanel
            folder={selectedFolderInfo}
            onChanged={HandleSharedFolderChanged}
          />
        )}

        {sharedFolders.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Folder className="h-3.5 w-3.5" aria-hidden />
              공동 폴더
            </p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {[
                { key: "all" as const, label: "전체" },
                ...sharedFolders.map((folder) => ({
                  key: folder.id as FolderFilter,
                  label: folder.name,
                })),
              ].map((item) => {
                const count = folderCounts.get(item.key) ?? 0;
                const isActive = selectedFolder === item.key;

                return (
                  <button
                    key={String(item.key)}
                    type="button"
                    onClick={() => setSelectedFolder(item.key)}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                    }`}
                  >
                    {item.key !== "all" && (
                      <Users className="h-3 w-3 shrink-0" aria-hidden />
                    )}
                    {item.label}
                    <span className="opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {[
            { key: "all", label: "전체" },
            { key: "wish", label: "가고 싶은 곳" },
            { key: "visited", label: "가본 곳 🐾" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setVisitFilter(item.key as "all" | "wish" | "visited")
              }
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                visitFilter === item.key
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Tag className="h-3.5 w-3.5" aria-hidden />
              태그 필터
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  selectedTag === null
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                전체
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    selectedTag === tag
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {statusMessage && (
          <p className="mb-4 rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-700">
            {statusMessage}
          </p>
        )}

        {isLoading && (
          <p className="py-10 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        )}

        {errorMessage && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {!isLoading &&
          !errorMessage &&
          sharedPlaces.length > 0 &&
          filteredPlaces.length === 0 && (
            <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-center">
              <p className="text-sm text-amber-800">
                {searchQuery.trim()
                  ? `"${searchQuery.trim()}"에 맞는 맛집이 없어요.`
                  : "선택한 폴더/필터에 맞는 맛집이 없어요."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={HandleResetFilters}
                  className="mt-2 text-xs font-semibold text-violet-600 underline"
                >
                  필터 초기화
                </button>
              )}
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          sharedPlaces.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-violet-200" aria-hidden />
              {sharedFolders.length === 0 ? (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    아직 공동 폴더가 없어요
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    위에서 폴더를 만들거나 친구의 초대 링크로 참여해 보세요.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    공유 폴더에 맛집이 없어요
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    지도에서 맛집을 검색해 공동 폴더에 저장해 보세요.
                  </p>
                </>
              )}
              <Link
                href="/map"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                맛집 검색하러 가기
              </Link>
            </div>
          )}

        <ul className="space-y-3 pb-4">
          {filteredPlaces.map((place) => (
            <li key={place.id}>
              <PlaceListItem
                place={place}
                folderName={
                  place.folder_id
                    ? folderNameMap.get(place.folder_id)
                    : undefined
                }
                isToggling={togglingPlaceId === place.id}
                isDeleting={deletingPlaceId === place.id}
                onToggleVisit={(item) => void HandleToggleVisit(item)}
                onDelete={(item) => void HandleDeletePlace(item)}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
