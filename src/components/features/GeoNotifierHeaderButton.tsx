"use client";

import { Bell, BellOff } from "lucide-react";
import { useGeoNotifierContext } from "@/components/features/GeoNotifierContext";

export default function GeoNotifierHeaderButton() {
  const { permissionState, isBannerVisible, HandleDisable, setIsBannerVisible } =
    useGeoNotifierContext();

  if (permissionState === "unsupported") {
    return null;
  }

  if (permissionState === "active") {
    return (
      <button
        type="button"
        onClick={HandleDisable}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/15"
        aria-label="근처 맛집 알림 끄기"
      >
        <Bell className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  if (permissionState === "denied" && !isBannerVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsBannerVisible(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200"
        aria-label="근처 맛집 알림 설정"
      >
        <BellOff className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  if (permissionState === "idle" && !isBannerVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsBannerVisible(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
        aria-label="근처 맛집 알림 받기"
      >
        <Bell className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  return null;
}
