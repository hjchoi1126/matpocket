import { CreateSupabaseClient } from "@/lib/supabaseClient";
import type { Place } from "@/types/place";

type ToggleVisitLogic1Result = {
  place?: Place;
  error?: string;
};

export async function ToggleVisitLogic1(
  placeId: number,
  visited: boolean,
): Promise<ToggleVisitLogic1Result> {
  try {
    const supabase = CreateSupabaseClient();

    const { data, error } = await supabase
      .from("places")
      .update({ visited })
      .eq("id", placeId)
      .select()
      .single();

    if (error) {
      return { error: `방문 상태 변경 실패: ${error.message}` };
    }

    return { place: data as Place };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}
