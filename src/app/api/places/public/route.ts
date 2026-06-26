import { NextResponse } from "next/server";
import { CreateSupabaseServerClient } from "@/lib/supabaseServer";
import type { Place } from "@/types/place";

type ShareProfile = {
  user_id: string;
  display_name: string;
  is_list_public: boolean;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id")?.trim();

  if (!userId) {
    return NextResponse.json({ error: "user_id가 필요합니다." }, { status: 400 });
  }

  try {
    const supabase = CreateSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from("share_profiles")
      .select("user_id, display_name, is_list_public")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: "공유 프로필을 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    const shareProfile = profile as ShareProfile | null;

    if (!shareProfile?.is_list_public) {
      return NextResponse.json(
        { error: "공개된 맛집 리스트가 아닙니다." },
        { status: 404 },
      );
    }

    const { data: places, error: placesError } = await supabase
      .from("places")
      .select("*")
      .eq("user_id", userId)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (placesError) {
      return NextResponse.json(
        { error: "공개 맛집 목록을 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      profile: shareProfile,
      places: (places ?? []) as Place[],
    });
  } catch {
    return NextResponse.json(
      { error: "Supabase 연결에 실패했습니다." },
      { status: 500 },
    );
  }
}
