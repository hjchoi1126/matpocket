"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrapeLogic1 } from "@/features/home/ScrapeLogic1";
import {
  LoadPlacesLogic1,
  SavePlaceLogic1,
} from "@/features/home/SavePlaceLogic1";
import { RecommendLogic1 } from "@/features/home/RecommendLogic1";
import { WeatherLogic1 } from "@/features/home/WeatherLogic1";
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { GetLocalNickname } from "@/lib/nickname";
import type { Place, PlaceFormData } from "@/types/place";
import type { Folder } from "@/types/folder";
import type { WeatherInfo, WeatherRecommendation } from "@/types/weather";

const PRESET_TAGS = ["#부모님과함께", "#혼밥", "#데이트", "#회식", "#브런치"];

const EMPTY_FORM: PlaceFormData = {
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

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function BuildRecommendChipLogic1(
  weather: WeatherInfo | null,
  recommendation: WeatherRecommendation | null,
  isLoadingWeather: boolean,
  hasPlaces: boolean,
): string {
  if (isLoadingWeather) return "날씨 확인 중...";
  if (!hasPlaces) return "맛집을 저장하면 날씨 맞춤 추천을 드려요";

  const day = DAY_LABELS[new Date().getDay()];
  const emoji =
    weather?.condition === "Rainy"
      ? "🌧️"
      : weather?.condition === "Sunny"
        ? "☀️"
        : weather?.condition === "Cold"
          ? "🥶"
          : weather?.condition === "Hot"
            ? "🔥"
            : "🌤️";

  const topPick = recommendation?.places[0];
  if (topPick) {
    return `${emoji} ${weather?.label ?? "오늘"} ${day}요일, ${topPick.place_name} 어때요?`;
  }

  return `${emoji} ${recommendation?.headline ?? weather?.description ?? "오늘의 맛집을 추천해 드릴게요"}`;
}

export function useHomeBasic01F() {
  const [form, setForm] = useState<PlaceFormData>(EMPTY_FORM);
  const [customTag, setCustomTag] = useState("");
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isCurationOpen, setIsCurationOpen] = useState(false);
  const [isRegisterSheetOpen, setIsRegisterSheetOpen] = useState(false);
  const [nickname, setNickname] = useState("맛집러");
  const [lastSavedPlace, setLastSavedPlace] = useState<Place | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  const recommendation = useMemo<WeatherRecommendation | null>(() => {
    if (!weather || savedPlaces.length === 0) return null;
    return RecommendLogic1(savedPlaces, weather.condition);
  }, [savedPlaces, weather]);

  const recommendationChipText = useMemo(
    () =>
      BuildRecommendChipLogic1(
        weather,
        recommendation,
        isLoadingWeather,
        savedPlaces.length > 0,
      ),
    [weather, recommendation, isLoadingWeather, savedPlaces.length],
  );

  useEffect(() => {
    setNickname(GetLocalNickname());
  }, []);

  const LoadPlaces = useCallback(async () => {
    setIsLoadingPlaces(true);
    const result = await LoadPlacesLogic1();
    setSavedPlaces(result.places);
    setIsLoadingPlaces(false);

    if (result.error) {
      setErrorMessage(result.error);
    }
  }, []);

  useEffect(() => {
    void LoadPlaces();
  }, [LoadPlaces]);

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
    let cancelled = false;

    async function LoadWeatherLogic1() {
      setIsLoadingWeather(true);

      const currentPosition = await new Promise<{
        lat: number | null;
        lng: number | null;
      }>((resolve) => {
        if (!navigator.geolocation) {
          resolve({ lat: null, lng: null });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (geo) =>
            resolve({
              lat: geo.coords.latitude,
              lng: geo.coords.longitude,
            }),
          () => resolve({ lat: null, lng: null }),
          { enableHighAccuracy: false, timeout: 5000 },
        );
      });

      const result = await WeatherLogic1({
        lat: currentPosition.lat,
        lng: currentPosition.lng,
      });

      if (!cancelled) {
        setWeather(result);
        setIsLoadingWeather(false);
      }
    }

    void LoadWeatherLogic1();

    return () => {
      cancelled = true;
    };
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

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setForm(EMPTY_FORM);
    setLastSavedPlace(result.place ?? null);
    setStatusMessage(`"${result.place?.place_name}"을(를) 저장했습니다.`);
    await LoadPlaces();
  }, [form, LoadPlaces]);

  const HandleReceiptVerified = useCallback((updatedPlace: Place) => {
    setLastSavedPlace(updatedPlace);
    setSavedPlaces((prev) =>
      prev.map((item) =>
        item.id === updatedPlace.id ? updatedPlace : item,
      ),
    );
    setStatusMessage("영수증 인증이 완료되었습니다! 찐맛집 배지가 부여됐어요.");
  }, []);

  return {
    form,
    customTag,
    setCustomTag,
    savedPlaces,
    isScraping,
    isSaving,
    isLoadingPlaces,
    errorMessage,
    statusMessage,
    presetTags: PRESET_TAGS,
    UpdateField,
    ToggleTag,
    AddCustomTag,
    HandleScrapeLink,
    HandleSavePlace,
    weather,
    isLoadingWeather,
    recommendation,
    isRouletteOpen,
    setIsRouletteOpen,
    isCurationOpen,
    setIsCurationOpen,
    isRegisterSheetOpen,
    setIsRegisterSheetOpen,
    nickname,
    recommendationChipText,
    lastSavedPlace,
    HandleReceiptVerified,
    folders,
    isLoadingFolders,
    HandleFolderCreated,
  };
}
