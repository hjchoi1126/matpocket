const EARTH_RADIUS_KM = 6371;

function ToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** 두 좌표 사이 직선 거리(km). Haversine 공식 */
export function HaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = ToRadians(lat2 - lat1);
  const dLon = ToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(ToRadians(lat1)) *
      Math.cos(ToRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function IsWithinRadiusKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number,
): boolean {
  return HaversineDistanceKm(lat1, lon1, lat2, lon2) <= radiusKm;
}
