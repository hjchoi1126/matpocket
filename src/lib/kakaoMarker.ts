const MARKER_SIZE = 36;

function BuildMarkerSvg(color: string, visited: boolean) {
  const icon = visited
    ? `<path d="M12 18l4 4 8-8" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="18" cy="16" r="4" fill="white"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 36 36">
    <path d="M18 2C11.4 2 6 7.2 6 13.6c0 8.4 12 20.4 12 20.4s12-12 12-20.4C30 7.2 24.6 2 18 2z" fill="${color}"/>
    ${icon}
  </svg>`;
}

export function CreatePlaceMarkerImageLogic1(visited: boolean) {
  const color = visited ? "#22c55e" : "#FF6B6B";
  const svg = BuildMarkerSvg(color, visited);
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const size = new window.kakao.maps.Size(MARKER_SIZE, MARKER_SIZE);
  const offset = new window.kakao.maps.Point(MARKER_SIZE / 2, MARKER_SIZE);

  return new window.kakao.maps.MarkerImage(src, size, { offset });
}

const CURRENT_LOCATION_SIZE = 20;

export function CreateCurrentLocationMarkerImageLogic1() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CURRENT_LOCATION_SIZE}" height="${CURRENT_LOCATION_SIZE}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" fill="#3B82F6" fill-opacity="0.25"/>
    <circle cx="10" cy="10" r="4.5" fill="#2563EB" stroke="white" stroke-width="2"/>
  </svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const size = new window.kakao.maps.Size(CURRENT_LOCATION_SIZE, CURRENT_LOCATION_SIZE);
  const offset = new window.kakao.maps.Point(
    CURRENT_LOCATION_SIZE / 2,
    CURRENT_LOCATION_SIZE / 2,
  );

  return new window.kakao.maps.MarkerImage(src, size, { offset });
}
