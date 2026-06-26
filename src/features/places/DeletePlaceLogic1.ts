import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import { CanEditPlaceInFolderLogic1 } from "@/features/folders/SharedFolderLogic1";
import type { Place } from "@/types/place";

export async function DeletePlaceLogic1(
  placeId: number,
): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    const { data: existingPlace, error: loadError } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .maybeSingle();

    if (loadError || !existingPlace) {
      return { error: "맛집을 찾을 수 없습니다." };
    }

    const place = existingPlace as Place;
    const canDelete = await CanEditPlaceInFolderLogic1(
      place.folder_id,
      place.user_id,
      userId,
    );

    if (!canDelete) {
      return { error: "이 맛집을 삭제할 권한이 없습니다." };
    }

    const { error } = await supabase.from("places").delete().eq("id", placeId);

    if (error) {
      return { error: "맛집 삭제에 실패했습니다." };
    }

    return {};
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}
