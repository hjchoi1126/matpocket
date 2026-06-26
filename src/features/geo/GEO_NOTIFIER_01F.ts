"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import {
  FilterNearbyPlacesLogic1,
  GEO_FENCE_RADIUS_KM,
} from "@/features/geo/GeoFenceLogic1";
import { TriggerGeoNotificationLogic1 } from "@/features/geo/GeoNotifyLogic1";
import type { Place } from "@/types/place";

const GEO_ENABLED_KEY = "matpocket_geo_notify_enabled";

export type GeoPermissionState = "unsupported" | "idle" | "active" | "denied";

export function useGeoNotifier01F() {
  const [permissionState, setPermissionState] =
    useState<GeoPermissionState>("idle");
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  const insidePlaceIdsRef = useRef<Set<number>>(new Set());
  const watchIdRef = useRef<number | null>(null);

  const LoadPlaces = useCallback(async () => {
    const result = await LoadPlacesLogic1();
    setPlaces(result.places);
  }, []);

  useEffect(() => {
    void LoadPlaces();
  }, [LoadPlaces]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window) || !navigator.geolocation) {
      setPermissionState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setPermissionState("denied");
      return;
    }

    if (
      Notification.permission === "granted" &&
      localStorage.getItem(GEO_ENABLED_KEY) === "true"
    ) {
      setPermissionState("active");
      setIsBannerVisible(false);
    }
  }, []);

  const HandlePositionUpdate = useCallback(
    (latitude: number, longitude: number) => {
      const nearbyPlaces = FilterNearbyPlacesLogic1(
        places,
        latitude,
        longitude,
        GEO_FENCE_RADIUS_KM,
      );
      const nearbyIds = new Set(nearbyPlaces.map((place) => place.id));

      nearbyPlaces.forEach((place) => {
        if (!insidePlaceIdsRef.current.has(place.id)) {
          insidePlaceIdsRef.current.add(place.id);
          void TriggerGeoNotificationLogic1(place);
        }
      });

      insidePlaceIdsRef.current.forEach((placeId) => {
        if (!nearbyIds.has(placeId)) {
          insidePlaceIdsRef.current.delete(placeId);
        }
      });
    },
    [places],
  );

  const StartWatching = useCallback(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        HandlePositionUpdate(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        setStatusMessage("위치 정보를 가져오지 못했습니다. 권한을 확인해 주세요.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 15_000,
      },
    );
  }, [HandlePositionUpdate]);

  useEffect(() => {
    if (permissionState !== "active") return;

    StartWatching();

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [permissionState, StartWatching, places]);

  const HandleEnable = useCallback(async () => {
    setIsEnabling(true);
    setStatusMessage(null);

    if (!("Notification" in window) || !navigator.geolocation) {
      setPermissionState("unsupported");
      setIsEnabling(false);
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setPermissionState("denied");
      setStatusMessage("알림 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.");
      setIsEnabling(false);
      return;
    }

    localStorage.setItem(GEO_ENABLED_KEY, "true");
    setPermissionState("active");
    setIsBannerVisible(false);
    setStatusMessage("근처 맛집 알림이 켜졌어요. 100m 이내 접근 시 알려드릴게요!");
    setIsEnabling(false);
    void LoadPlaces();
  }, [LoadPlaces]);

  const HandleDisable = useCallback(() => {
    localStorage.removeItem(GEO_ENABLED_KEY);
    insidePlaceIdsRef.current.clear();

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setPermissionState("idle");
    setIsBannerVisible(true);
    setStatusMessage(null);
  }, []);

  const hasGeoPlaces = places.some(
    (place) => place.latitude != null && place.longitude != null,
  );

  return {
    permissionState,
    isBannerVisible,
    setIsBannerVisible,
    isEnabling,
    statusMessage,
    hasGeoPlaces,
    HandleEnable,
    HandleDisable,
  };
}
