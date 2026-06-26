"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrapeLogic1 } from "@/features/home/ScrapeLogic1";
import { SavePlaceLogic1 } from "@/features/home/SavePlaceLogic1";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import type { Place, PlaceFormData } from "@/types/place";
import type { Folder } from "@/types/folder";

export const PLACE_REGISTER_PRESET_TAGS = [
  "#부모님과함께",
  "#혼밥",
  "#데이트",
  "#회식",
  "#브런치",
];

export const EMPTY_PLACE_FORM: PlaceFormData = {
  place_name: "",
  address: "",
  latitude: "",
  longitude: "",
  category: "",
  memo: "",
  tags: [],
  link_url: "",
  folder_id: null,
};

type UsePlaceRegister01FOptions = {
  onSaved?: (place: Place) => void | Promise<void>;
};

export function usePlaceRegister01F(options: UsePlaceRegister01FOptions = {}) {
  const [form, setForm] = useState<PlaceFormData>(EMPTY_PLACE_FORM);
  const [customTag, setCustomTag] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSavedPlace, setLastSavedPlace] = useState<Place | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  const LoadFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    const result = await LoadFoldersLogic1();
    setFolders(result.folders);
    setIsLoadingFolders(false);
  }, []);

  useEffect(() => {
    void LoadFolders();
  }, [LoadFolders]);

  const ResetForm = useCallback(() => {
    setForm(EMPTY_PLACE_FORM);
    setCustomTag("");
    setErrorMessage(null);
    setStatusMessage(null);
    setLastSavedPlace(null);
  }, []);

  const HandleFolderCreated = useCallback((folder: Folder) => {
    setFolders((prev) => [folder, ...prev]);
  }, []);

  const UpdateField = useCallback(
    <K extends keyof PlaceFormData>(key: K, value: PlaceFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const ToggleTag = useCallback((tag: string) => {
    setForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists
          ? prev.tags.filter((item) => item !== tag)
          : [...prev.tags, tag],
      };
    });
  }, []);

  const AddCustomTag = useCallback(() => {
    const normalized = customTag.trim().startsWith("#")
      ? customTag.trim()
      : `#${customTag.trim()}`;

    if (!normalized || normalized === "#") return;

    setForm((prev) => {
      if (prev.tags.includes(normalized)) {
        return prev;
      }
      return { ...prev, tags: [...prev.tags, normalized] };
    });
    setCustomTag("");
  }, [customTag]);

  const HandleScrapeLink = useCallback(async () => {
    if (!form.link_url.trim()) {
      setErrorMessage("링크를 입력해 주세요.");
      return;
    }

    setIsScraping(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const result = await ScrapeLogic1(form.link_url.trim());
    setIsScraping(false);

    if (result.error || !result.data) {
      setErrorMessage(result.error ?? "링크 분석에 실패했습니다.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      place_name: result.data?.place_name ?? prev.place_name,
      address: result.data?.address ?? prev.address,
      category: result.data?.category ?? prev.category,
      link_url: result.data?.link_url ?? prev.link_url,
      memo: result.data?.hint ? `링크 힌트: ${result.data.hint}` : prev.memo,
    }));

    setStatusMessage("링크에서 정보를 불러왔습니다. 내용을 확인하고 저장해 주세요.");
  }, [form.link_url]);

  const HandleSavePlace = useCallback(async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const result = await SavePlaceLogic1(form);
    setIsSaving(false);

    if (result.error || !result.place) {
      setErrorMessage(result.error ?? "맛집 저장에 실패했습니다.");
      return;
    }

    setForm(EMPTY_PLACE_FORM);
    setLastSavedPlace(result.place);
    setStatusMessage(`"${result.place.place_name}"을(를) 저장했습니다.`);
    await options.onSaved?.(result.place);
  }, [form, options]);

  const HandleReceiptVerified = useCallback((updatedPlace: Place) => {
    setLastSavedPlace(updatedPlace);
    setStatusMessage("영수증 인증이 완료되었습니다! 찐맛집 배지가 부여됐어요.");
  }, []);

  return {
    form,
    customTag,
    setCustomTag,
    isScraping,
    isSaving,
    errorMessage,
    statusMessage,
    presetTags: PLACE_REGISTER_PRESET_TAGS,
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
    ResetForm,
    ReloadFolders: LoadFolders,
  };
}
