import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import type { PlaceTimelineMemo } from "@/types/timeline";

export async function LoadTimelineMemosLogic1(
  placeId: number,
): Promise<{ memos: PlaceTimelineMemo[]; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("place_timeline_memos")
      .select("*")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (error) {
      return { memos: [], error: "타임라인 메모를 불러오지 못했습니다." };
    }

    return { memos: (data ?? []) as PlaceTimelineMemo[] };
  } catch {
    return { memos: [], error: "Supabase 연결에 실패했습니다." };
  }
}

export async function AddTimelineMemoLogic1(
  placeId: number,
  content: string,
): Promise<{ memo?: PlaceTimelineMemo; error?: string }> {
  const trimmed = content.trim();

  if (!trimmed) {
    return { error: "메모 내용을 입력해 주세요." };
  }

  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("place_timeline_memos")
      .insert({
        place_id: placeId,
        user_id: GetLocalUserId() || null,
        content: trimmed,
      })
      .select()
      .single();

    if (error) {
      return { error: "메모 저장에 실패했습니다." };
    }

    return { memo: data as PlaceTimelineMemo };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function DeleteTimelineMemoLogic1(
  memoId: number,
  placeId: number,
): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { error } = await supabase
      .from("place_timeline_memos")
      .delete()
      .eq("id", memoId)
      .eq("place_id", placeId);

    if (error) {
      return { error: "메모 삭제에 실패했습니다." };
    }

    return {};
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export function FormatTimelineDate(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
