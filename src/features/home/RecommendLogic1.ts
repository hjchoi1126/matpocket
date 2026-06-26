import type { Place } from "@/types/place";
import type { WeatherCondition, WeatherRecommendation } from "@/types/weather";

const WEATHER_RULES: Record<
  WeatherCondition,
  { tags: string[]; categories: string[]; headline: string }
> = {
  Rainy: {
    tags: ["#전", "#막걸리", "#국물"],
    categories: ["한식", "국밥", "찌개", "국물"],
    headline: "비 오는 날엔 따뜻한 국물 어때요?",
  },
  Sunny: {
    tags: ["#카페", "#일식", "#브런치"],
    categories: ["카페", "일식", "양식", "브런치"],
    headline: "맑은 날엔 가볍게 즐겨보세요",
  },
  Cloudy: {
    tags: ["#혼밥", "#데이트", "#한식"],
    categories: ["한식", "카페", "분식"],
    headline: "흐린 날엔 편안한 한 끼",
  },
  Cold: {
    tags: ["#국물", "#전", "#부모님과함께"],
    categories: ["한식", "찌개", "국밥", "전"],
    headline: "쌀쌀할 땐 든든한 국물이 최고",
  },
  Hot: {
    tags: ["#카페", "#일식", "#혼밥"],
    categories: ["카페", "일식", "냉면", "디저트"],
    headline: "더운 날엔 시원한 메뉴로",
  },
};

function NormalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function ScorePlaceLogic1(
  place: Place,
  tags: string[],
  categories: string[],
): number {
  let score = 0;
  const placeTags = place.tags.map(NormalizeText);
  const category = NormalizeText(place.category ?? "");
  const memo = NormalizeText(place.memo ?? "");
  const name = NormalizeText(place.place_name);

  tags.forEach((tag) => {
    const normalizedTag = NormalizeText(tag.replace(/^#/, ""));
    if (placeTags.some((item) => item.includes(normalizedTag))) {
      score += 3;
    }
    if (category.includes(normalizedTag) || memo.includes(normalizedTag)) {
      score += 1;
    }
  });

  categories.forEach((item) => {
    const normalizedCategory = NormalizeText(item);
    if (category.includes(normalizedCategory) || name.includes(normalizedCategory)) {
      score += 2;
    }
  });

  return score;
}

export function RecommendLogic1(
  places: Place[],
  condition: WeatherCondition,
): WeatherRecommendation {
  const rule = WEATHER_RULES[condition];

  const ranked = [...places]
    .map((place) => ({
      place,
      score: ScorePlaceLogic1(place, rule.tags, rule.categories),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.place);

  return {
    headline: rule.headline,
    suggestedTags: rule.tags,
    places: ranked,
  };
}
