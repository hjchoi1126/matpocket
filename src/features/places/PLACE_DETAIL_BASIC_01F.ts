"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LoadPlaceByIdLogic1,
  UpdatePlaceLogic1,
} from "@/features/places/PlaceDetailLogic1";
import { ToggleVisitLogic1 } from "@/features/places/VisitLogic1";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import type { Place, PlaceFormData } from "@/types/place";
import type { Folder } from "@/types/folder";

export function usePlaceDetailBasic01F(placeId: number) {
  const [place, setPlace] = useState<Place | null>(null);
  const [form, setForm] = useState<PlaceFormData>({
    place_name: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "",
    memo: "",
    tags: [],
    link_url: "",
    folder_id: null,
  });
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingVisit, setIsTogglingVisit] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const LoadPlace = useCallback(async () => {
    setIsLoading(true);
    const result = await LoadPlaceByIdLogic1(placeId);
    setPlace(result.place ?? null);
    setErrorMessage(result.error ?? null);

    if (result.place) {
      setForm({
        place_name: result.place.place_name,
        address: result.place.address ?? "",
        latitude: result.place.latitude?.toString() ?? "",
        longitude: result.place.longitude?.toString() ?? "",
        category: result.place.category ?? "",
        memo: result.place.memo ?? "",
        tags: result.place.tags,
        link_url: result.place.link_url ?? "",
        folder_id: result.place.folder_id,
      });
    }

    setIsLoading(false);
  }, [placeId]);

  const LoadFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    const result = await LoadFoldersLogic1();
    setFolders(result.folders);
    setIsLoadingFolders(false);
  }, []);

  useEffect(() => {
    void LoadFolders();
  }, [LoadFolders]);

  const HandleFolderCreated = useCallback((folder: Folder) => {
    setFolders((prev) => [folder, ...prev]);
  }, []);

  useEffect(() => {
    void LoadPlace();
  }, [LoadPlace]);

  const UpdateField = useCallback(
    <K extends keyof PlaceFormData>(key: K, value: PlaceFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const HandleSave = useCallback(async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const result = await UpdatePlaceLogic1(placeId, {
      place_name: form.place_name.trim(),
      address: form.address.trim() || null,
      category: form.category.trim() || null,
      memo: form.memo.trim() || null,
      folder_id: form.folder_id,
    });

    setIsSaving(false);

    if (result.error || !result.place) {
      setErrorMessage(result.error ?? "수정에 실패했습니다.");
      return;
    }

    setPlace(result.place);
    setStatusMessage("맛집 정보를 저장했습니다.");
  }, [form, placeId]);

  const HandleToggleVisit = useCallback(async () => {
    if (!place) return;

    setIsTogglingVisit(true);
    const result = await ToggleVisitLogic1(place.id, !Boolean(place.visited));
    setIsTogglingVisit(false);

    if (result.error || !result.place) {
      setErrorMessage(result.error ?? "방문 상태 변경에 실패했습니다.");
      return;
    }

    setPlace(result.place);
  }, [place]);

  const HandleReceiptVerified = useCallback((updatedPlace: Place) => {
    setPlace(updatedPlace);
    setStatusMessage("영수증 인증이 완료되었습니다! 찐맛집 배지가 부여됐어요.");
  }, []);

  return {
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
  };
}
