"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetCurrentPositionLogic1 } from "@/lib/geolocation";
import { CreatePlaceMarkerImageLogic1 } from "@/lib/kakaoMarker";
import {
  AttachMapResizeObserverLogic1,
  CreateKakaoMapLogic1,
  WaitForMapContainerLogic1,
} from "@/lib/kakaoMap";
import type { GeoPosition } from "@/types/restaurant";
import type { Place } from "@/types/place";

type MarkerListener = {
  marker: kakao.maps.Marker;
  listener: () => void;
};

export function useHomeMap01F(places: Place[]) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const markerListenersRef = useRef<MarkerListener[]>([]);

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const ClearMarkers = useCallback(() => {
    markerListenersRef.current.forEach(({ marker, listener }) => {
      window.kakao.maps.event.removeListener(marker, "click", listener);
      marker.setMap(null);
    });
    markerListenersRef.current = [];
    markersRef.current = [];
  }, []);

  const HandleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place);

    if (
      mapRef.current &&
      place.latitude != null &&
      place.longitude != null
    ) {
      mapRef.current.setCenter(
        new window.kakao.maps.LatLng(place.latitude, place.longitude),
      );
    }
  }, []);

  const HandleClosePlaceSheet = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  const RenderMarkersLogic1 = useCallback(
    (markerPlaces: Place[]) => {
      if (!mapRef.current) return;

      ClearMarkers();

      markerPlaces.forEach((place) => {
        if (place.latitude == null || place.longitude == null) return;

        const marker = new window.kakao.maps.Marker({
          map: mapRef.current as kakao.maps.Map,
          position: new window.kakao.maps.LatLng(
            place.latitude,
            place.longitude,
          ),
          image: CreatePlaceMarkerImageLogic1(Boolean(place.visited)),
        });

        const listener = () => {
          HandleSelectPlace(place);
        };

        window.kakao.maps.event.addListener(marker, "click", listener);
        markersRef.current.push(marker);
        markerListenersRef.current.push({ marker, listener });
      });
    },
    [ClearMarkers, HandleSelectPlace],
  );

  useEffect(() => {
    let cancelled = false;

    async function InitLocationLogic1() {
      const result = await GetCurrentPositionLogic1();

      if (!cancelled) {
        setPosition(result.position);
        setIsLoadingLocation(false);
        if (result.isFallback && result.errorMessage) {
          setMapError(result.errorMessage);
        }
      }
    }

    void InitLocationLogic1();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!position) return;

    let cancelled = false;
    let detachResizeObserver: (() => void) | null = null;

    async function InitMapLogic1() {
      if (!position) return;

      try {
        const container = await WaitForMapContainerLogic1(
          () => mapContainerRef.current,
        );
        if (cancelled) return;

        const map = await CreateKakaoMapLogic1(container, position, 5);
        if (cancelled) return;

        mapRef.current = map;
        detachResizeObserver = AttachMapResizeObserverLogic1(container, map);

        requestAnimationFrame(() => {
          mapRef.current?.relayout();
          if (!cancelled) {
            setIsMapReady(true);
          }
        });
      } catch (error) {
        if (!cancelled) {
          setMapError(
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
      mapRef.current = null;
    };
  }, [position, ClearMarkers]);

  useEffect(() => {
    if (!isMapReady) return;

    const markerPlaces = places.filter(
      (place) => place.latitude != null && place.longitude != null,
    );

    RenderMarkersLogic1(markerPlaces);
  }, [isMapReady, places, RenderMarkersLogic1]);

  useEffect(() => {
    if (!selectedPlace) return;

    const updatedPlace = places.find((place) => place.id === selectedPlace.id);
    if (updatedPlace) {
      setSelectedPlace(updatedPlace);
    }
  }, [places, selectedPlace]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const HandleResize = () => {
      mapRef.current?.relayout();
    };

    window.addEventListener("resize", HandleResize);
    return () => window.removeEventListener("resize", HandleResize);
  }, [isMapReady]);

  return {
    mapContainerRef,
    isMapReady,
    isLoadingLocation,
    mapError,
    selectedPlace,
    HandleClosePlaceSheet,
  };
}
