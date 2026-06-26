import type { WeatherInfo } from "@/types/weather";

type WeatherLogic1Params = {
  lat?: number | null;
  lng?: number | null;
};

export async function WeatherLogic1({
  lat,
  lng,
}: WeatherLogic1Params = {}): Promise<WeatherInfo> {
  const params = new URLSearchParams();

  if (lat != null && lng != null) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }

  const query = params.toString();
  const response = await fetch(`/api/weather${query ? `?${query}` : ""}`);

  if (!response.ok) {
    return {
      condition: "Rainy",
      label: "비 오는 날",
      description: "따뜻한 국물이 생각나는 날씨예요.",
      temperature: 18,
      source: "fallback",
    };
  }

  return (await response.json()) as WeatherInfo;
}
