"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetCurrentPositionLogic1 } from "@/lib/geolocation";
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
import { LoadFoldersLogic1 } from "@/features/folders/FolderLogic1";
import { SearchLogic1 } from "@/features/map/SearchLogic1";
import { LoadSavedIdsLogic1, SaveLogic1 } from "@/features/map/SaveLogic1";
import type { Folder } from "@/types/folder";
import type { GeoPosition, KakaoPlace } from "@/types/restaurant";

export function useMapSearch01F(initialQuery = "") {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const currentLocationMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const selectedPlaceMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const hasRunInitialSearchRef = useRef(false);

  const [query, setQuery] = useState(initialQuery);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [savingPlaceId, setSavingPlaceId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const MoveMapToPlaceLogic1 = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    const center = new window.kakao.maps.LatLng(lat, lng);
    mapRef.current.setCenter(center);
    mapRef.current.setLevel(3);

    if (!selectedPlaceMarkerRef.current) {
      selectedPlaceMarkerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: center,
        image: CreatePlaceMarkerImageLogic1(false),
      });
      return;
    }

    selectedPlaceMarkerRef.current.setPosition(center);
    selectedPlaceMarkerRef.current.setMap(mapRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let detachResizeObserver: (() => void) | null = null;

    async function InitMapLogic1() {
      try {
        const locationResult = await GetCurrentPositionLogic1();
        if (cancelled) return;

        setPosition(locationResult.position);
        setIsLoadingLocation(false);

        if (locationResult.isFallback && locationResult.errorMessage) {
          setErrorMessage(locationResult.errorMessage);
        }

        const container = await WaitForMapContainerLogic1(
          () => mapContainerRef.current,
        );
        if (cancelled) return;

        const map = await CreateKakaoMapLogic1(
          container,
          locationResult.position,
          4,
        );
        if (cancelled) return;

        mapRef.current = map;
        RenderCurrentLocationMarkerLogic1(locationResult.position);
        detachResizeObserver = AttachMapResizeObserverLogic1(container, map);
        setIsMapReady(true);
      } catch (error) {
        if (!cancelled) {
          setIsMapReady(false);
          setIsLoadingLocation(false);
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
      currentLocationMarkerRef.current?.setMap(null);
      currentLocationMarkerRef.current = null;
      selectedPlaceMarkerRef.current?.setMap(null);
      selectedPlaceMarkerRef.current = null;
      mapRef.current = null;
    };
  }, [RenderCurrentLocationMarkerLogic1]);

  useEffect(() => {
    if (!isMapReady || !position) return;

    RenderCurrentLocationMarkerLogic1(position);
    mapRef.current?.setCenter(
      new window.kakao.maps.LatLng(position.lat, position.lng),
    );
  }, [isMapReady, position, RenderCurrentLocationMarkerLogic1]);

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

  useEffect(() => {
    void LoadSavedIdsLogic1().then(setSavedPlaceIds);
  }, []);

  useEffect(() => {
    void LoadFoldersLogic1().then((result) => {
      setFolders(result.folders);
      setIsLoadingFolders(false);
    });
  }, []);

  const HandleFolderCreated = useCallback((folder: Folder) => {
    setFolders((prev) => [folder, ...prev]);
  }, []);

  const RunSearchLogic1 = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        return { ok: false as const };
      }

      setIsSearching(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const result = await SearchLogic1({ query: trimmedQuery, position });

      setPlaces(result.places);
      setIsSearching(false);

      if (result.error) {
        setErrorMessage(result.error);
        return { ok: false as const };
      }

      if (result.places.length === 0) {
        setStatusMessage("검색 결과가 없습니다. 다른 키워드로 시도해 보세요.");
        return { ok: false as const };
      }

      const firstPlace = result.places[0];
      setSelectedPlaceId(firstPlace.id);
      MoveMapToPlaceLogic1(Number(firstPlace.y), Number(firstPlace.x));
      return { ok: true as const };
    },
    [MoveMapToPlaceLogic1, position],
  );

  const HandleSearch = useCallback(async () => {
    await RunSearchLogic1(query);
  }, [RunSearchLogic1, query]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (
      !initialQuery.trim() ||
      !isMapReady ||
      !position ||
      hasRunInitialSearchRef.current
    ) {
      return;
    }

    hasRunInitialSearchRef.current = true;
    void RunSearchLogic1(initialQuery);
  }, [initialQuery, isMapReady, position, RunSearchLogic1]);

  const HandleSelectPlace = useCallback(
    (place: KakaoPlace) => {
      setSelectedPlaceId(place.id);
      MoveMapToPlaceLogic1(Number(place.y), Number(place.x));
    },
    [MoveMapToPlaceLogic1],
  );

  const HandleSavePlace = useCallback(async (place: KakaoPlace) => {
    setSavingPlaceId(place.id);
    setErrorMessage(null);
    setStatusMessage(null);

    const result = await SaveLogic1(place, selectedFolderId);

    setSavingPlaceId(null);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setSavedPlaceIds((prev) => new Set(prev).add(place.place_url));
    const folderName = folders.find((folder) => folder.id === selectedFolderId)?.name;
    setStatusMessage(
      folderName
        ? `"${place.place_name}"을(를) "${folderName}" 폴더에 저장했습니다.`
        : `"${place.place_name}"을(를) 저장했습니다.`,
    );
  }, [folders, selectedFolderId]);

  return {
    mapContainerRef,
    query,
    setQuery,
    places,
    selectedPlaceId,
    savedPlaceIds,
    isSearching,
    isMapReady,
    isLoadingLocation,
    savingPlaceId,
    folders,
    isLoadingFolders,
    selectedFolderId,
    setSelectedFolderId,
    HandleFolderCreated,
    errorMessage,
    statusMessage,
    HandleSearch,
    HandleSelectPlace,
    HandleSavePlace,
  };
}
