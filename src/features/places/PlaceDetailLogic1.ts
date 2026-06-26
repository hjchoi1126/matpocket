import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import { CanEditPlaceInFolderLogic1 } from "@/features/folders/SharedFolderLogic1";
import type { Place } from "@/types/place";

function NormalizePlace(place: Place): Place {
  return {
    ...place,
    visited: Boolean(place.visited),
    receipt_verified: Boolean(place.receipt_verified),
  };
}

export async function LoadPlaceByIdLogic1(
  placeId: number,
): Promise<{ place?: Place; error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .maybeSingle();

    if (error) {
      return { error: "맛집 정보를 불러오지 못했습니다." };
    }

    if (!data) {
      return { error: "맛집을 찾을 수 없습니다." };
    }

    return { place: NormalizePlace(data as Place) };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function UpdatePlaceLogic1(
  placeId: number,
  updates: Partial<
    Pick<Place, "place_name" | "address" | "category" | "memo" | "visited" | "receipt_verified" | "receipt_verified_at" | "folder_id">
  >,
): Promise<{ place?: Place; error?: string }> {
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

    const normalizedExisting = NormalizePlace(existingPlace as Place);
    const canEdit = await CanEditPlaceInFolderLogic1(
      normalizedExisting.folder_id,
      normalizedExisting.user_id,
      userId,
    );

    if (!canEdit) {
      return { error: "이 맛집을 수정할 권한이 없습니다." };
    }

    const { data, error } = await supabase
      .from("places")
      .update(updates)
      .eq("id", placeId)
      .select()
      .single();

    if (error) {
      return { error: "맛집 수정에 실패했습니다." };
    }

    return { place: NormalizePlace(data as Place) };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}
