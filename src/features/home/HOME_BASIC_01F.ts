"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { RecommendLogic1 } from "@/features/home/RecommendLogic1";
import { WeatherLogic1 } from "@/features/home/WeatherLogic1";
import { GetLocalNickname } from "@/lib/nickname";
import type { Place } from "@/types/place";
import type { WeatherInfo, WeatherRecommendation } from "@/types/weather";

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
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isCurationOpen, setIsCurationOpen] = useState(false);
  const [nickname, setNickname] = useState("맛집러");

  const LoadPlaces = useCallback(async () => {
    setIsLoadingPlaces(true);
    const result = await LoadPlacesLogic1();
    setSavedPlaces(result.places);
    setIsLoadingPlaces(false);

    if (result.error) {
      setErrorMessage(result.error);
    }
  }, []);

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

  useEffect(() => {
    void LoadPlaces();
  }, [LoadPlaces]);

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

  return {
    savedPlaces,
    isLoadingPlaces,
    errorMessage,
    isLoadingWeather,
    isRouletteOpen,
    setIsRouletteOpen,
    isCurationOpen,
    setIsCurationOpen,
    nickname,
    recommendationChipText,
  };
}
