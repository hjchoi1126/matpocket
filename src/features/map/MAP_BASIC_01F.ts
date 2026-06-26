"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetCurrentPositionLogic1 } from "@/lib/geolocation";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { ToggleVisitLogic1 } from "@/features/places/VisitLogic1";
import { NearbyPlacesLogic1 } from "@/lib/NearbyPlacesLogic1";
import {
  CreateCurrentLocationMarkerImageLogic1,
  CreatePlaceMarkerImageLogic1,
} from "@/lib/kakaoMarker";
import {
  AttachMapResizeObserverLogic1,
  CreateKakaoMapLogic1,
  RelayoutKakaoMapLogic1,
  WaitForMapContainerLogic1,
} from "@/lib/kakaoMap";
import type { GeoPosition } from "@/types/restaurant";
import type { NearbyPlace, Place } from "@/types/place";

export function useMapBasic01F() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const currentLocationMarkerRef = useRef<kakao.maps.Marker | null>(null);

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [isFallbackLocation, setIsFallbackLocation] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [togglingPlaceId, setTogglingPlaceId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"nearby" | "search">("nearby");

  const ClearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const RenderCurrentLocationMarkerLogic1 = useCallback((geo: GeoPosition) => {
    if (!mapRef.current) return;

    const markerPosition = new window.kakao.maps.LatLng(geo.lat, geo.lng);

    if (!currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: markerPosition,
        image: CreateCurrentLocationMarkerImageLogic1(),
      });
      return;
    }

    currentLocationMarkerRef.current.setPosition(markerPosition);
    currentLocationMarkerRef.current.setMap(mapRef.current);
  }, []);

  const RenderMarkersLogic1 = useCallback(
    (places: Array<Place | NearbyPlace>) => {
      if (!mapRef.current) return;

      ClearMarkers();

      places.forEach((place) => {
        if (place.latitude == null || place.longitude == null) return;

        const marker = new window.kakao.maps.Marker({
          map: mapRef.current as kakao.maps.Map,
          position: new window.kakao.maps.LatLng(
            place.latitude,
            place.longitude,
          ),
          image: CreatePlaceMarkerImageLogic1(Boolean(place.visited)),
        });

        markersRef.current.push(marker);
      });
    },
    [ClearMarkers],
  );

  const LoadSavedPlaces = useCallback(async () => {
    const result = await LoadPlacesLogic1();
    setSavedPlaces(result.places);
    return result.places;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function InitLocationLogic1() {
      const result = await GetCurrentPositionLogic1();

      if (cancelled) return;

      setPosition(result.position);
      setIsFallbackLocation(result.isFallback);

      if (result.isFallback && result.errorMessage) {
        setErrorMessage(result.errorMessage);
      }

      setIsLoadingLocation(false);
    }

    void InitLocationLogic1();
    void LoadSavedPlaces();

    return () => {
      cancelled = true;
    };
  }, [LoadSavedPlaces]);

  useEffect(() => {
    if (activeTab !== "nearby" || !position) return;

    let cancelled = false;
    let detachResizeObserver: (() => void) | null = null;

    async function InitMapLogic1() {
      const currentPosition = position;
      if (!currentPosition) return;

      try {
        const container = await WaitForMapContainerLogic1(
          () => mapContainerRef.current,
        );
        if (cancelled) return;

        const map = await CreateKakaoMapLogic1(container, currentPosition, 4);
        if (cancelled) return;

        mapRef.current = map;
        RenderCurrentLocationMarkerLogic1(currentPosition);
        detachResizeObserver = AttachMapResizeObserverLogic1(container, map);
        setIsMapReady(true);
      } catch (error) {
        if (!cancelled) {
          setIsMapReady(false);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "지도를 불러오지 못했습니다.",
          );
        }
      }
    }

    void InitMapLogic1();

    return () => {
      cancelled = true;
      detachResizeObserver?.();
      setIsMapReady(false);
      ClearMarkers();
      currentLocationMarkerRef.current?.setMap(null);
      currentLocationMarkerRef.current = null;
      mapRef.current = null;
    };
  }, [activeTab, position, ClearMarkers, RenderCurrentLocationMarkerLogic1]);

  useEffect(() => {
    if (!isMapReady || !position) return;

    RenderCurrentLocationMarkerLogic1(position);
    mapRef.current?.setCenter(new window.kakao.maps.LatLng(position.lat, position.lng));
  }, [isMapReady, position, RenderCurrentLocationMarkerLogic1]);

  useEffect(() => {
    if (!isMapReady) return;

    const markerPlaces =
      nearbyPlaces.length > 0
        ? nearbyPlaces
        : savedPlaces.filter(
            (place) => place.latitude != null && place.longitude != null,
          );

    RenderMarkersLogic1(markerPlaces);
  }, [isMapReady, nearbyPlaces, savedPlaces, RenderMarkersLogic1]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const HandleResize = () => {
      if (mapRef.current) {
        RelayoutKakaoMapLogic1(mapRef.current);
      }
    };

    window.addEventListener("resize", HandleResize);
    return () => window.removeEventListener("resize", HandleResize);
  }, [isMapReady]);

  const HandleNearbySearch = useCallback(async () => {
    if (!position) {
      setErrorMessage("현재 위치를 가져오지 못했습니다.");
      return;
    }

    setIsSearchingNearby(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const result = await NearbyPlacesLogic1({
      lat: position.lat,
      lng: position.lng,
      radiusKm: 1,
    });

    setNearbyPlaces(result.places);
    setIsSearchingNearby(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result.places.length === 0) {
      setStatusMessage(
        "반경 1km 안에 저장된 맛집이 없습니다. 홈에서 맛집을 등록해 보세요.",
      );
      return;
    }

    setStatusMessage(`반경 1km 내 맛집 ${result.places.length}곳을 찾았습니다.`);
  }, [position]);

  const HandleToggleVisit = useCallback(
    async (place: Place | NearbyPlace) => {
      setTogglingPlaceId(place.id);
      const nextVisited = !Boolean(place.visited);

      const result = await ToggleVisitLogic1(place.id, nextVisited);
      setTogglingPlaceId(null);

      if (result.error || !result.place) {
        setErrorMessage(result.error ?? "방문 상태 변경에 실패했습니다.");
        return;
      }

      const updateNearbyPlace = (item: NearbyPlace) =>
        item.id === place.id
          ? { ...item, visited: result.place!.visited }
          : item;

      const updateSavedPlace = (item: Place) =>
        item.id === place.id
          ? { ...item, visited: result.place!.visited }
          : item;

      setNearbyPlaces((prev) => prev.map(updateNearbyPlace));
      setSavedPlaces((prev) => prev.map(updateSavedPlace));
      setStatusMessage(
        result.place.visited
          ? `"${result.place.place_name}" 방문 완료! 발도장을 찍었어요 🐾`
          : `"${result.place.place_name}" 방문 취소했습니다.`,
      );
    },
    [],
  );

  const displayPlaces =
    nearbyPlaces.length > 0
      ? nearbyPlaces
      : savedPlaces.filter(
          (place) => place.latitude != null && place.longitude != null,
        );

  return {
    mapContainerRef,
    position,
    isFallbackLocation,
    displayPlaces,
    isLoadingLocation,
    isSearchingNearby,
    isMapReady,
    togglingPlaceId,
    errorMessage,
    statusMessage,
    activeTab,
    setActiveTab,
    HandleNearbySearch,
    HandleToggleVisit,
    ReloadSavedPlaces: LoadSavedPlaces,
  };
}
