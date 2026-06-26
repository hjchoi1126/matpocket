"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Folder, Heart, Tag, Users } from "lucide-react";
import PlaceListItem from "@/components/features/PlaceListItem";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { ToggleVisitLogic1 } from "@/features/places/VisitLogic1";
import type { FolderFilter } from "@/types/folder";
import type { Folder as FolderType } from "@/types/folder";
import type { Place } from "@/types/place";

export default function SAVED_BASIC_01() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderFilter>("all");
  const [visitFilter, setVisitFilter] = useState<"all" | "wish" | "visited">(
    "all",
  );
  const [togglingPlaceId, setTogglingPlaceId] = useState<number | null>(null);

  const personalFolders = useMemo(
    () => folders.filter((folder) => !folder.is_shared),
    [folders],
  );

  const sharedFolderIds = useMemo(
    () => new Set(folders.filter((folder) => folder.is_shared).map((f) => f.id)),
    [folders],
  );

  const personalPlaces = useMemo(
    () =>
      places.filter(
        (place) =>
          place.folder_id == null || !sharedFolderIds.has(place.folder_id),
      ),
    [places, sharedFolderIds],
  );

  const LoadData = useCallback(async () => {
    setIsLoading(true);
    const [placesResult, foldersResult] = await Promise.all([
      LoadPlacesLogic1(),
      LoadFoldersLogic1(),
    ]);
    setPlaces(placesResult.places);
    setFolders(foldersResult.folders);
    setErrorMessage(placesResult.error ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void LoadData();
  }, [LoadData, pathname]);

  useEffect(() => {
    const HandleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void LoadData();
      }
    };

    document.addEventListener("visibilitychange", HandleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", HandleVisibilityChange);
    };
  }, [LoadData]);

  useEffect(() => {
    const folderParam = searchParams.get("folder");
    if (!folderParam || isLoading) return;

    const folderId = Number(folderParam);
    if (Number.isNaN(folderId)) return;

    const folder = folders.find((item) => item.id === folderId);
    if (folder?.is_shared) {
      router.replace(`/shared?folder=${folderId}`);
      return;
    }

    setSelectedFolder(folderId);
  }, [searchParams, folders, isLoading, router]);

  const folderNameMap = useMemo(() => {
    return new Map(personalFolders.map((folder) => [folder.id, folder.name]));
  }, [personalFolders]);

  const folderCounts = useMemo(() => {
    const counts = new Map<FolderFilter, number>();
    counts.set("all", personalPlaces.length);
    counts.set(
      "unassigned",
      personalPlaces.filter((place) => place.folder_id == null).length,
    );
    personalFolders.forEach((folder) => {
      counts.set(
        folder.id,
        personalPlaces.filter((place) => place.folder_id === folder.id).length,
      );
    });
    return counts;
  }, [personalPlaces, personalFolders]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    personalPlaces.forEach((place) => {
      place.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [personalPlaces]);

  const filteredPlaces = useMemo(() => {
    return personalPlaces.filter((place) => {
      const folderMatch =
        selectedFolder === "all" ||
        (selectedFolder === "unassigned" && place.folder_id == null) ||
        place.folder_id === selectedFolder;
      const tagMatch = !selectedTag || place.tags.includes(selectedTag);
      const visitMatch =
        visitFilter === "all" ||
        (visitFilter === "visited" && place.visited) ||
        (visitFilter === "wish" && !place.visited);
      return folderMatch && tagMatch && visitMatch;
    });
  }, [personalPlaces, selectedFolder, selectedTag, visitFilter]);

  const HandleToggleVisit = async (place: Place) => {
    setTogglingPlaceId(place.id);
    const result = await ToggleVisitLogic1(place.id, !Boolean(place.visited));
    setTogglingPlaceId(null);

    if (result.error || !result.place) {
      setErrorMessage(result.error ?? "방문 상태 변경에 실패했습니다.");
      return;
    }

    setPlaces((prev) =>
      prev.map((item) =>
        item.id === place.id ? { ...item, visited: result.place!.visited } : item,
      ),
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" aria-hidden />
          <h1 className="text-lg font-bold text-gray-900">저장소</h1>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <Link
          href="/vote/create"
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary"
        >
          <Users className="h-4 w-4" aria-hidden />
          이번 주 회식 어디로? 투표방 만들기
        </Link>

        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
            <Folder className="h-3.5 w-3.5" aria-hidden />
            저장 폴더
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {[
              { key: "all" as const, label: "전체" },
              { key: "unassigned" as const, label: "미분류" },
              ...personalFolders.map((folder) => ({
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
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                  <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

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
                  ? "bg-primary text-white"
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
                    ? "bg-primary/15 text-primary"
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
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
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

        {!isLoading && !errorMessage && personalPlaces.length > 0 && filteredPlaces.length === 0 && (
          <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-center">
            <p className="text-sm text-amber-800">
              선택한 폴더/필터에 맞는 맛집이 없어요.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedFolder("all");
                setSelectedTag(null);
                setVisitFilter("all");
              }}
              className="mt-2 text-xs font-semibold text-primary underline"
            >
              전체 맛집 보기
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && filteredPlaces.length === 0 && personalPlaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="mb-3 h-10 w-10 text-gray-200" aria-hidden />
            <p className="text-sm text-gray-500">표시할 맛집이 없습니다.</p>
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
                onToggleVisit={(item) => void HandleToggleVisit(item)}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
