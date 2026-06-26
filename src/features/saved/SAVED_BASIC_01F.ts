"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { ToggleVisitLogic1 } from "@/features/places/VisitLogic1";
import { SearchSavedPlacesLogic1 } from "@/features/saved/SavedSearchLogic1";
import type { FolderFilter } from "@/types/folder";
import type { Folder as FolderType } from "@/types/folder";
import type { Place } from "@/types/place";

export function useSavedBasic01F() {
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

  const personalFolders = useMemo(
    () => folders.filter((folder) => !folder.is_shared),
    [folders],
  );

  const sharedFolderIds = useMemo(
    () =>
      new Set(folders.filter((folder) => folder.is_shared).map((folder) => folder.id)),
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
    const filteredByOptions = personalPlaces.filter((place) => {
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

    return SearchSavedPlacesLogic1(
      filteredByOptions,
      searchQuery,
      folderNameMap,
    );
  }, [
    personalPlaces,
    selectedFolder,
    selectedTag,
    visitFilter,
    searchQuery,
    folderNameMap,
  ]);

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

  const HandleResetFilters = () => {
    setSelectedFolder("all");
    setSelectedTag(null);
    setVisitFilter("all");
    setSearchQuery("");
  };

  return {
    personalFolders,
    personalPlaces,
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
    folderNameMap,
    folderCounts,
    allTags,
    filteredPlaces,
    HandleToggleVisit,
    HandleResetFilters,
  };
}
