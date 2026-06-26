import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalUserId } from "@/lib/userId";
import { GetMemberFolderIdsLogic1 } from "@/features/folders/SharedFolderLogic1";
import type { Place, PlaceFormData } from "@/types/place";

type SavePlaceLogic1Result = {
  place?: Place;
  error?: string;
};

function FormatSupabaseError(prefix: string, error: { message: string; details?: string | null; hint?: string | null }) {
  const detail = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" / ");

  return `${prefix}: ${detail}`;
}

function ParseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function SavePlaceLogic1(
  form: PlaceFormData,
): Promise<SavePlaceLogic1Result> {
  const placeName = form.place_name.trim();

  if (!placeName) {
    return { error: "맛집 이름을 입력해 주세요." };
  }

  try {
    const supabase = CreateSupabaseClient();

    const { data, error } = await supabase
      .from("places")
      .insert({
        user_id: GetLocalUserId() || null,
        place_name: placeName,
        address: form.address.trim() || null,
        latitude: ParseCoordinate(form.latitude),
        longitude: ParseCoordinate(form.longitude),
        category: form.category.trim() || null,
        memo: form.memo.trim() || null,
        tags: form.tags,
        link_url: form.link_url.trim() || null,
        is_public: false,
        visited: false,
        folder_id: form.folder_id,
      })
      .select()
      .single();

    if (error) {
      return {
        error: FormatSupabaseError(
          "맛집 저장 실패",
          error,
        ),
      };
    }

    return { place: data as Place };
  } catch {
    return { error: "Supabase 연결에 실패했습니다." };
  }
}

export async function LoadPlacesLogic1(): Promise<{
  places: Place[];
  error?: string;
}> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    if (!userId) {
      return { places: [] };
    }

    const memberFolderIds = await GetMemberFolderIdsLogic1(userId);
    const placeMap = new Map<number, Place>();

    const { data: ownPlaces, error: ownError } = await supabase
      .from("places")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ownError) {
      return { places: [], error: "저장된 맛집을 불러오지 못했습니다." };
    }

    (ownPlaces ?? []).forEach((place) => {
      const normalized = {
        ...(place as Place),
        visited: Boolean((place as Place).visited),
        receipt_verified: Boolean((place as Place).receipt_verified),
      };
      placeMap.set(normalized.id, normalized);
    });

    if (memberFolderIds.length > 0) {
      const { data: sharedPlaces, error: sharedError } = await supabase
        .from("places")
        .select("*")
        .in("folder_id", memberFolderIds)
        .order("created_at", { ascending: false });

      if (sharedError) {
        return { places: [], error: "공동 폴더 맛집을 불러오지 못했습니다." };
      }

      (sharedPlaces ?? []).forEach((place) => {
        const normalized = {
          ...(place as Place),
          visited: Boolean((place as Place).visited),
          receipt_verified: Boolean((place as Place).receipt_verified),
        };
        placeMap.set(normalized.id, normalized);
      });
    }

    const places = Array.from(placeMap.values()).sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );

    return { places };
  } catch {
    return { places: [], error: "Supabase 연결에 실패했습니다." };
  }
}
