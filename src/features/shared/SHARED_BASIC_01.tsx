"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Folder, Loader2, Plus, Tag, Users } from "lucide-react";
import PlaceListItem from "@/components/features/PlaceListItem";
import SharedFolderPanel from "@/components/features/SharedFolderPanel";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { CreateSharedFolderLogic1 } from "@/features/folders/SharedFolderLogic1";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { ToggleVisitLogic1 } from "@/features/places/VisitLogic1";
import type { FolderFilter } from "@/types/folder";
import type { Folder as FolderType } from "@/types/folder";
import type { Place } from "@/types/place";

export default function SHARED_BASIC_01() {
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
  const [sharedFolderName, setSharedFolderName] = useState("");
  const [isCreatingSharedFolder, setIsCreatingSharedFolder] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sharedFolders = useMemo(
    () => folders.filter((folder) => folder.is_shared),
    [folders],
  );

  const sharedFolderIds = useMemo(
    () => new Set(sharedFolders.map((folder) => folder.id)),
    [sharedFolders],
  );

  const sharedPlaces = useMemo(
    () =>
      places.filter(
        (place) =>
          place.folder_id != null && sharedFolderIds.has(place.folder_id),
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
    if (!placesResult.error && foldersResult.error) {
      setStatusMessage(foldersResult.error);
    }
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

    const folder = sharedFolders.find((item) => item.id === folderId);
    if (folder) {
      setSelectedFolder(folderId);
    }
  }, [searchParams, sharedFolders, isLoading]);

  const folderNameMap = useMemo(() => {
    return new Map(sharedFolders.map((folder) => [folder.id, folder.name]));
  }, [sharedFolders]);

  const selectedFolderInfo = useMemo(() => {
    if (typeof selectedFolder !== "number") {
      return null;
    }

    return sharedFolders.find((folder) => folder.id === selectedFolder) ?? null;
  }, [sharedFolders, selectedFolder]);

  const folderCounts = useMemo(() => {
    const counts = new Map<FolderFilter, number>();
    counts.set("all", sharedPlaces.length);
    sharedFolders.forEach((folder) => {
      counts.set(
        folder.id,
        sharedPlaces.filter((place) => place.folder_id === folder.id).length,
      );
    });
    return counts;
  }, [sharedPlaces, sharedFolders]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    sharedPlaces.forEach((place) => {
      place.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [sharedPlaces]);

  const filteredPlaces = useMemo(() => {
    return sharedPlaces.filter((place) => {
      const folderMatch =
        selectedFolder === "all" || place.folder_id === selectedFolder;
      const tagMatch = !selectedTag || place.tags.includes(selectedTag);
      const visitMatch =
        visitFilter === "all" ||
        (visitFilter === "visited" && place.visited) ||
        (visitFilter === "wish" && !place.visited);
      return folderMatch && tagMatch && visitMatch;
    });
  }, [sharedPlaces, selectedFolder, selectedTag, visitFilter]);

  const HandleSharedFolderChanged = useCallback(() => {
    setSelectedFolder("all");
    setStatusMessage(null);
    void LoadData();
  }, [LoadData]);

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

  const HandleCreateSharedFolder = async () => {
    setIsCreatingSharedFolder(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const result = await CreateSharedFolderLogic1(sharedFolderName);
    setIsCreatingSharedFolder(false);

    if (result.error || !result.folder) {
      setErrorMessage(result.error ?? "공동 폴더 생성에 실패했습니다.");
      return;
    }

    setFolders((prev) => [result.folder!, ...prev]);
    setSelectedFolder(result.folder.id);
    setSharedFolderName("");
    setStatusMessage(`"${result.folder.name}" 공동 폴더가 만들어졌어요.`);
    router.replace(`/shared?folder=${result.folder.id}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-600" aria-hidden />
          <h1 className="text-lg font-bold text-gray-900">공유저장소</h1>
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
                선택한 폴더/필터에 맞는 맛집이 없어요.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFolder("all");
                  setSelectedTag(null);
                  setVisitFilter("all");
                }}
                className="mt-2 text-xs font-semibold text-violet-600 underline"
              >
                전체 맛집 보기
              </button>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          sharedFolders.length === 0 &&
          sharedPlaces.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-violet-200" aria-hidden />
              <p className="text-sm font-medium text-gray-700">
                아직 공동 폴더가 없어요
              </p>
              <p className="mt-1 text-xs text-gray-500">
                위에서 폴더를 만들거나 친구의 초대 링크로 참여해 보세요.
              </p>
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
