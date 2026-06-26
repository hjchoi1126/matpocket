"use client";

import { usePathname } from "next/navigation";
import { Bell, Loader2, MapPin, X } from "lucide-react";
import { useGeoNotifierContext } from "@/components/features/GeoNotifierContext";
import GeoNotifierHeaderButton from "@/components/features/GeoNotifierHeaderButton";

export default function GeoNotifierInner() {
  const pathname = usePathname();
  const hasBottomNav =
    !pathname.startsWith("/vote") && !pathname.startsWith("/share");
  const isHome = pathname === "/";
  const bannerBottomClass = hasBottomNav
    ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
    : "bottom-[calc(1rem+env(safe-area-inset-bottom))]";

  const {
    permissionState,
    isBannerVisible,
    setIsBannerVisible,
    isEnabling,
    statusMessage,
    hasGeoPlaces,
    HandleEnable,
  } = useGeoNotifierContext();

  if (permissionState === "unsupported") {
    return null;
  }

  return (
    <>
      {!isHome && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-md px-4 pt-4">
          <div className="pointer-events-none flex justify-end">
            <div className="pointer-events-auto">
              <GeoNotifierHeaderButton />
            </div>
          </div>
        </div>
      )}

      {isBannerVisible && permissionState !== "active" && (
        <div
          className={`fixed inset-x-0 z-40 mx-auto w-full max-w-md px-4 ${bannerBottomClass}`}
        >
          <div className="rounded-2xl border border-primary/20 bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  근처 맛집 알림 받기
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  저장해 둔 맛집 100m 안에 들어오면 &quot;어? 저장해 두신 맛집이
                  바로 근처에 있어요!&quot; 알림을 보내드려요.
                </p>
                {!hasGeoPlaces && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    위도·경도가 있는 맛집을 저장하면 알림이 작동합니다.
                  </p>
                )}
                {permissionState === "denied" && (
                  <p className="mt-2 text-[11px] text-red-600">
                    알림이 차단되어 있습니다. 브라우저 설정에서 허용해 주세요.
                  </p>
                )}
                {statusMessage && (
                  <p className="mt-2 text-[11px] text-primary">{statusMessage}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={isEnabling || permissionState === "denied"}
                    onClick={() => void HandleEnable()}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {isEnabling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Bell className="h-3.5 w-3.5" aria-hidden />
                    )}
                    알림 켜기
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBannerVisible(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600"
                  >
                    나중에
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerVisible(false)}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
