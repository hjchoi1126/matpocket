import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import type { KakaoPlace } from "@/types/restaurant";
import type { Place } from "@/types/place";

type SaveLogic1Result = {
  place?: Place;
  error?: string;
};

export async function SaveLogic1(place: KakaoPlace): Promise<SaveLogic1Result> {
  try {
    const supabase = CreateSupabaseClient();

    const { data, error } = await supabase
      .from("places")
      .insert({
        user_id: GetLocalUserId() || null,
        place_name: place.place_name,
        address: place.road_address_name || place.address_name || null,
        latitude: Number(place.y),
        longitude: Number(place.x),
        category: place.category_name || "카카오맵",
        memo: place.phone ? `전화: ${place.phone}` : null,
        tags: [],
        link_url: place.place_url || null,
        is_public: false,
        visited: false,
      })
      .select()
      .single();

    if (error) {
      return {
        error: `맛집 저장 실패: ${error.message}${error.details ? ` (${error.details})` : ""}`,
      };
    }

    return { place: data as Place };
  } catch {
    return {
      error: "Supabase 연결에 실패했습니다. 환경변수를 확인해 주세요.",
    };
  }
}

export async function LoadSavedIdsLogic1(): Promise<Set<string>> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    let query = supabase
      .from("places")
      .select("link_url")
      .not("link_url", "is", null);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return new Set();
    }

    return new Set(
      (data ?? [])
        .map((item) => item.link_url)
        .filter((url): url is string => Boolean(url)),
    );
  } catch {
    return new Set();
  }
}
