export type WeatherCondition = "Rainy" | "Sunny" | "Cloudy" | "Cold" | "Hot";

export type WeatherInfo = {
  condition: WeatherCondition;
  label: string;
  description: string;
  temperature?: number;
  source: "openweathermap" | "fallback";
};

export type WeatherRecommendation = {
  headline: string;
  suggestedTags: string[];
  places: import("@/types/place").Place[];
};
