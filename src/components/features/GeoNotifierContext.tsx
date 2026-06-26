"use client";

import { createContext, useContext } from "react";
import {
  useGeoNotifier01F,
  type GeoPermissionState,
} from "@/features/geo/GEO_NOTIFIER_01F";

type GeoNotifierContextValue = {
  permissionState: GeoPermissionState;
  isBannerVisible: boolean;
  setIsBannerVisible: (visible: boolean) => void;
  isEnabling: boolean;
  statusMessage: string | null;
  hasGeoPlaces: boolean;
  HandleEnable: () => Promise<void>;
  HandleDisable: () => void;
};

const GeoNotifierContext = createContext<GeoNotifierContextValue | null>(null);

export function GeoNotifierProvider({ children }: { children: React.ReactNode }) {
  const value = useGeoNotifier01F();

  return (
    <GeoNotifierContext.Provider value={value}>
      {children}
    </GeoNotifierContext.Provider>
  );
}

export function useGeoNotifierContext() {
  const context = useContext(GeoNotifierContext);

  if (!context) {
    throw new Error(
      "useGeoNotifierContext는 GeoNotifierProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return context;
}
