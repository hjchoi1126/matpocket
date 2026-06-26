import type { GeoPosition } from "@/types/restaurant";

const DEFAULT_CENTER: GeoPosition = { lat: 37.5665, lng: 126.978 };
const POSITION_CACHE_KEY = "matpocket_geo_position";
const POSITION_CACHE_TS_KEY = "matpocket_geo_position_ts";
const POSITION_CACHE_TTL_MS = 10 * 60 * 1000;

export type CurrentPositionResult = {
  position: GeoPosition;
  isFallback: boolean;
  errorMessage?: string;
};

function ReadCachedPositionLogic1(): GeoPosition | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(POSITION_CACHE_KEY);
    const cachedAt = sessionStorage.getItem(POSITION_CACHE_TS_KEY);

    if (!raw || !cachedAt) return null;
    if (Date.now() - Number(cachedAt) > POSITION_CACHE_TTL_MS) return null;

    const parsed = JSON.parse(raw) as GeoPosition;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      !Number.isNaN(parsed.lat) &&
      !Number.isNaN(parsed.lng)
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function WriteCachedPositionLogic1(position: GeoPosition) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(POSITION_CACHE_KEY, JSON.stringify(position));
  sessionStorage.setItem(POSITION_CACHE_TS_KEY, String(Date.now()));
}

export function GetCurrentPositionLogic1(): Promise<CurrentPositionResult> {
  const cachedPosition = ReadCachedPositionLogic1();

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve({
        position: cachedPosition ?? DEFAULT_CENTER,
        isFallback: true,
        errorMessage: "이 기기에서는 위치 정보를 사용할 수 없습니다.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const position = {
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
        };
        WriteCachedPositionLogic1(position);
        resolve({ position, isFallback: false });
      },
      (error) => {
        if (cachedPosition) {
          resolve({ position: cachedPosition, isFallback: false });
          return;
        }

        const errorMessage =
          error.code === error.PERMISSION_DENIED
            ? "위치 권한이 필요합니다. 브라우저 설정에서 허용해 주세요."
            : "현재 위치를 가져오지 못했습니다.";

        resolve({
          position: DEFAULT_CENTER,
          isFallback: true,
          errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 60_000,
      },
    );
  });
}
