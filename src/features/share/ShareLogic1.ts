import { CreateSupabaseClient } from "@/lib/supabaseClient";
import { GetLocalNickname } from "@/lib/nickname";
import { GetLocalUserId } from "@/lib/userId";
import type { Place } from "@/types/place";

export type ShareProfile = {
  user_id: string;
  display_name: string;
  is_list_public: boolean;
};

export function BuildShareUrlLogic1(userId?: string) {
  const id = userId ?? GetLocalUserId();
  if (typeof window === "undefined") {
    return `/share/${id}`;
  }
  return `${window.location.origin}/share/${id}`;
}

export async function LoadPublicPlacesLogic1(userId: string): Promise<{
  profile?: ShareProfile;
  places: Place[];
  error?: string;
}> {
  const response = await fetch(
    `/api/places/public?user_id=${encodeURIComponent(userId)}`,
  );

  const payload = (await response.json().catch(() => null)) as {
    profile?: ShareProfile;
    places?: Place[];
    error?: string;
  } | null;

  if (!response.ok || !payload) {
    return {
      places: [],
      error: payload?.error ?? "공유 리스트를 불러오지 못했습니다.",
    };
  }

  return {
    profile: payload.profile,
    places: payload.places ?? [],
  };
}

export async function PublishShareListLogic1(): Promise<{
  shareUrl?: string;
  error?: string;
}> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();
    const displayName = GetLocalNickname();

    const { error: profileError } = await supabase.from("share_profiles").upsert(
      {
        user_id: userId,
        display_name: displayName,
        is_list_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (profileError) {
      return { error: "공유 프로필 저장에 실패했습니다." };
    }

    const { error: placesError } = await supabase
      .from("places")
      .update({ is_public: true })
      .eq("user_id", userId);

    if (placesError) {
      return { error: "맛집 공개 설정에 실패했습니다." };
    }

    return { shareUrl: BuildShareUrlLogic1(userId) };
  } catch {
    return { error: "공유 설정 중 오류가 발생했습니다." };
  }
}

export async function UnpublishShareListLogic1(): Promise<{ error?: string }> {
  try {
    const supabase = CreateSupabaseClient();
    const userId = GetLocalUserId();

    const { error: profileError } = await supabase
      .from("share_profiles")
      .update({ is_list_public: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (profileError) {
      return { error: "공유 해제에 실패했습니다." };
    }

    return {};
  } catch {
    return { error: "공유 해제 중 오류가 발생했습니다." };
  }
}

export async function CopyShareLinkLogic1(
  shareUrl: string,
): Promise<{ error?: string }> {
  try {
    await navigator.clipboard.writeText(shareUrl);
    return {};
  } catch {
    return { error: "링크 복사에 실패했습니다." };
  }
}

export async function KakaoShareLogic1({
  title,
  description,
  shareUrl,
}: {
  title: string;
  description: string;
  shareUrl: string;
}): Promise<{ error?: string }> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text: description, url: shareUrl });
      return {};
    } catch {
      // 사용자가 공유를 취소한 경우 fallback으로 복사 시도
    }
  }

  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  if (typeof window !== "undefined" && kakaoKey && window.Kakao?.Share) {
    try {
      if (!window.Kakao.isInitialized?.()) {
        window.Kakao.init(kakaoKey);
      }

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: `${window.location.origin}/icons/icon-512x512.svg`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "맛집 리스트 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
      return {};
    } catch {
      return CopyShareLinkLogic1(shareUrl);
    }
  }

  return CopyShareLinkLogic1(shareUrl);
}
