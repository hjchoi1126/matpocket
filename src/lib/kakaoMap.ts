import type { GeoPosition } from "@/types/restaurant";

const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";

function BuildKakaoMapSdkUrl(appKey: string) {
  return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
}

export function LoadKakaoMapSdk(): Promise<void> {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  if (!appKey) {
    return Promise.reject(
      new Error(
        "카카오 지도 키가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY를 추가해 주세요.",
      ),
    );
  }

  if (typeof window !== "undefined" && window.kakao?.maps?.load) {
    return new Promise((resolve) => {
      window.kakao.maps.load(() => resolve());
    });
  }

  const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => {
        window.kakao.maps.load(() => resolve());
      });
      existingScript.addEventListener("error", () => {
        reject(
          new Error(
            "카카오 지도 SDK를 불러오지 못했습니다. JavaScript 키와 플랫폼 도메인을 확인해 주세요.",
          ),
        );
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = BuildKakaoMapSdkUrl(appKey);
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      reject(
        new Error(
          "카카오 지도 SDK를 불러오지 못했습니다.\n\n확인: JavaScript 키 사용 여부, Web 플랫폼(localhost:3000) 등록, 제품 설정에서 '지도' 활성화",
        ),
      );
    };
    document.head.appendChild(script);
  });
}

export function RelayoutKakaoMapLogic1(map: kakao.maps.Map) {
  requestAnimationFrame(() => {
    map.relayout();
    requestAnimationFrame(() => {
      map.relayout();
    });
  });
}

export function WaitForMapContainerLogic1(
  getContainer: () => HTMLDivElement | null,
  maxAttempts = 40,
): Promise<HTMLDivElement> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tick = () => {
      const container = getContainer();

      if (container) {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          resolve(container);
          return;
        }

        if (attempts >= maxAttempts) {
          resolve(container);
          return;
        }
      }

      attempts += 1;

      if (attempts >= maxAttempts) {
        reject(new Error("지도 영역을 불러오지 못했습니다."));
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

export function AttachMapResizeObserverLogic1(
  container: HTMLDivElement,
  map: kakao.maps.Map,
): () => void {
  const observer = new ResizeObserver(() => {
    RelayoutKakaoMapLogic1(map);
  });

  observer.observe(container);
  return () => observer.disconnect();
}

export async function CreateKakaoMapLogic1(
  container: HTMLDivElement,
  center: GeoPosition,
  level = 4,
): Promise<kakao.maps.Map> {
  await LoadKakaoMapSdk();

  const map = new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(center.lat, center.lng),
    level,
  });

  RelayoutKakaoMapLogic1(map);
  return map;
}
