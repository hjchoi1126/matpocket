/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

type GeoFenceMessage = {
  type: "GEOFENCE_NEARBY";
  payload: {
    placeId: number;
    placeName: string;
    address?: string | null;
  };
};

type PushPayload = {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
};

function BuildNotificationOptions(
  data: PushPayload & { placeId?: number },
) {
  return {
    body:
      data.body ??
      "어? 저장해 두신 맛집이 바로 근처에 있어요!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: data.tag ?? (data.placeId ? `geofence-${data.placeId}` : "geofence"),
    data: {
      url: data.url ?? "/map",
    },
  } satisfies NotificationOptions;
}

self.addEventListener("push", (event) => {
  let payload: PushPayload = {};

  try {
    payload = (event.data?.json() as PushPayload) ?? {};
  } catch {
    payload = {
      body: event.data?.text() ?? undefined,
    };
  }

  const title =
    payload.title ?? "[맛포켓] 근처에 저장해 둔 맛집이 있어요! 📍";

  event.waitUntil(
    self.registration.showNotification(
      title,
      BuildNotificationOptions(payload),
    ),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data as GeoFenceMessage | undefined;

  if (data?.type !== "GEOFENCE_NEARBY") return;

  const { placeId, placeName, address } = data.payload;

  event.waitUntil(
    self.registration.showNotification(
      "[맛포켓] 근처에 저장해 둔 맛집이 있어요! 📍",
      BuildNotificationOptions({
        placeId,
        body: address
          ? `${placeName} · ${address}`
          : `어? 저장해 두신 ${placeName}이(가) 바로 근처에 있어요!`,
        url: `/places/${placeId}`,
        tag: `geofence-${placeId}`,
      }),
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl =
    (event.notification.data?.url as string | undefined) ?? "/map";
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (!(client instanceof WindowClient)) continue;
          if (!client.url.startsWith(self.location.origin)) continue;

          return client.focus().then((focusedClient) => {
            if ("navigate" in focusedClient) {
              return focusedClient.navigate(targetUrl);
            }
            return focusedClient;
          });
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});

export {};
