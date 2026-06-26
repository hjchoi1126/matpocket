import type { Place } from "@/types/place";

const COOLDOWN_MS = 30 * 60 * 1000;
const COOLDOWN_KEY_PREFIX = "matpocket_geofence_notified_";

type GeoNotificationPayload = {
  placeId: number;
  placeName: string;
  address?: string | null;
};

function GetCooldownKey(placeId: number): string {
  return `${COOLDOWN_KEY_PREFIX}${placeId}`;
}

export function IsGeoNotificationOnCooldownLogic1(placeId: number): boolean {
  if (typeof window === "undefined") return true;

  const raw = localStorage.getItem(GetCooldownKey(placeId));
  if (!raw) return false;

  const notifiedAt = Number(raw);
  return Number.isFinite(notifiedAt) && Date.now() - notifiedAt < COOLDOWN_MS;
}

export function MarkGeoNotificationCooldownLogic1(placeId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GetCooldownKey(placeId), String(Date.now()));
}

async function ShowViaServiceWorker(
  payload: GeoNotificationPayload,
): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const target = registration.active ?? registration.waiting;

  if (target) {
    target.postMessage({
      type: "GEOFENCE_NEARBY",
      payload,
    });
    return true;
  }

  await registration.showNotification(
    "[맛포켓] 근처에 저장해 둔 맛집이 있어요! 📍",
    {
      body: payload.address
        ? `${payload.placeName} · ${payload.address}`
        : `어? 저장해 두신 ${payload.placeName}이(가) 바로 근처에 있어요!`,
      icon: "/icons/icon-192x192.svg",
      badge: "/icons/icon-192x192.svg",
      tag: `geofence-${payload.placeId}`,
      data: { url: `/places/${payload.placeId}` },
    },
  );

  return true;
}

function ShowViaBrowserNotification(payload: GeoNotificationPayload): void {
  if (typeof Notification === "undefined") return;

  const notification = new Notification(
    "[맛포켓] 근처에 저장해 둔 맛집이 있어요! 📍",
    {
      body: payload.address
        ? `${payload.placeName} · ${payload.address}`
        : `어? 저장해 두신 ${payload.placeName}이(가) 바로 근처에 있어요!`,
      icon: "/icons/icon-192x192.svg",
      tag: `geofence-${payload.placeId}`,
      data: { url: `/places/${payload.placeId}` },
    },
  );

  notification.onclick = () => {
    window.focus();
    window.location.href = `/places/${payload.placeId}`;
    notification.close();
  };
}

export async function TriggerGeoNotificationLogic1(
  place: Place,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (IsGeoNotificationOnCooldownLogic1(place.id)) return;

  const payload: GeoNotificationPayload = {
    placeId: place.id,
    placeName: place.place_name,
    address: place.address,
  };

  const sent = await ShowViaServiceWorker(payload);
  if (!sent) {
    ShowViaBrowserNotification(payload);
  }

  MarkGeoNotificationCooldownLogic1(place.id);
}
