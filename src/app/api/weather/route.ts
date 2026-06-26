import { NextResponse } from "next/server";
import type { WeatherCondition, WeatherInfo } from "@/types/weather";

const FALLBACK_WEATHER: WeatherInfo = {
  condition: "Rainy",
  label: "비 오는 날",
  description: "따뜻한 국물이 생각나는 날씨예요.",
  temperature: 18,
  source: "fallback",
};

function MapOpenWeatherToCondition(main: string, temp: number): WeatherCondition {
  const normalized = main.toLowerCase();

  if (normalized.includes("rain") || normalized.includes("drizzle")) {
    return "Rainy";
  }
  if (normalized.includes("snow") || temp <= 5) {
    return "Cold";
  }
  if (normalized.includes("clear") && temp >= 28) {
    return "Hot";
  }
  if (normalized.includes("clear")) {
    return "Sunny";
  }

  return "Cloudy";
}

function BuildWeatherLabel(condition: WeatherCondition): Pick<WeatherInfo, "label" | "description"> {
  switch (condition) {
    case "Rainy":
      return {
        label: "비 오는 날",
        description: "따뜻한 국물과 전이 잘 어울려요.",
      };
    case "Sunny":
      return {
        label: "맑은 날",
        description: "가볍게 즐기기 좋은 카페·일식을 추천해요.",
      };
    case "Cloudy":
      return {
        label: "흐린 날",
        description: "부담 없는 한 끼가 딱이에요.",
      };
    case "Cold":
      return {
        label: "쌀쌀한 날",
        description: "뜨끈한 국물 요리가 최고예요.",
      };
    case "Hot":
      return {
        label: "더운 날",
        description: "시원한 메뉴와 카페가 잘 맞아요.",
      };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey || !lat || !lng) {
    return NextResponse.json(FALLBACK_WEATHER);
  }

  try {
    const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    weatherUrl.searchParams.set("lat", lat);
    weatherUrl.searchParams.set("lon", lng);
    weatherUrl.searchParams.set("appid", apiKey);
    weatherUrl.searchParams.set("units", "metric");
    weatherUrl.searchParams.set("lang", "kr");

    const response = await fetch(weatherUrl, { next: { revalidate: 1800 } });

    if (!response.ok) {
      return NextResponse.json(FALLBACK_WEATHER);
    }

    const payload = (await response.json()) as {
      main?: { temp?: number };
      weather?: Array<{ main?: string }>;
    };

    const temp = payload.main?.temp ?? 20;
    const main = payload.weather?.[0]?.main ?? "Clouds";
    const condition = MapOpenWeatherToCondition(main, temp);
    const copy = BuildWeatherLabel(condition);

    const weather: WeatherInfo = {
      condition,
      ...copy,
      temperature: Math.round(temp),
      source: "openweathermap",
    };

    return NextResponse.json(weather);
  } catch {
    return NextResponse.json(FALLBACK_WEATHER);
  }
}
