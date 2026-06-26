"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { CreateSharedFolderLogic1 } from "@/features/folders/SharedFolderLogic1";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { ToggleVisitLogic1 } from "@/features/places/VisitLogic1";
import { DeletePlaceLogic1 } from "@/features/places/DeletePlaceLogic1";
import { SearchSavedPlacesLogic1 } from "@/features/saved/SavedSearchLogic1";
import type { FolderFilter } from "@/types/folder";
import type { Folder as FolderType } from "@/types/folder";
import type { Place } from "@/types/place";

export function useSharedBasic01F() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderFilter>("all");
  const [visitFilter, setVisitFilter] = useState<"all" | "wish" | "visited">(
    "all",
  );
  const [togglingPlaceId, setTogglingPlaceId] = useState<number | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<number | null>(null);
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
    const filteredByOptions = sharedPlaces.filter((place) => {
      const folderMatch =
        selectedFolder === "all" || place.folder_id === selectedFolder;
      const tagMatch = !selectedTag || place.tags.includes(selectedTag);
      const visitMatch =
        visitFilter === "all" ||
        (visitFilter === "visited" && place.visited) ||
        (visitFilter === "wish" && !place.visited);
      return folderMatch && tagMatch && visitMatch;
    });

    return SearchSavedPlacesLogic1(
      filteredByOptions,
      searchQuery,
      folderNameMap,
    );
  }, [
    sharedPlaces,
    selectedFolder,
    selectedTag,
    visitFilter,
    searchQuery,
    folderNameMap,
  ]);

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

  const HandleDeletePlace = async (place: Place) => {
    const confirmed = window.confirm(
      `"${place.place_name}"을(를) 공유 폴더에서 삭제할까요?\n타임라인 메모와 사진도 함께 삭제됩니다.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingPlaceId(place.id);
    setErrorMessage(null);

    const result = await DeletePlaceLogic1(place.id);
    setDeletingPlaceId(null);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setPlaces((prev) => prev.filter((item) => item.id !== place.id));
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

  const HandleResetFilters = () => {
    setSelectedFolder("all");
    setSelectedTag(null);
    setVisitFilter("all");
    setSearchQuery("");
  };

  return {
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
  };
}
