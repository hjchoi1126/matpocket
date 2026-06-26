import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SHARE_BASIC_01 from "@/features/share/SHARE_BASIC_01";
import { CreateSupabaseServerClient } from "@/lib/supabaseServer";
import type { Place } from "@/types/place";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

type ShareProfileRow = {
  user_id: string;
  display_name: string;
  is_list_public: boolean;
};

async function LoadSharePageData(userId: string) {
  const supabase = CreateSupabaseServerClient();

  const { data: profile } = await supabase
    .from("share_profiles")
    .select("user_id, display_name, is_list_public")
    .eq("user_id", userId)
    .maybeSingle();

  const shareProfile = profile as ShareProfileRow | null;

  if (!shareProfile?.is_list_public) {
    return null;
  }

  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return {
    profile: shareProfile,
    places: (places ?? []) as Place[],
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await LoadSharePageData(id);

  if (!data) {
    return { title: "공유 리스트를 찾을 수 없습니다" };
  }

  return {
    title: `${data.profile.display_name}님의 맛포켓 리스트`,
    description: `${data.profile.display_name}님이 공유한 맛집 ${data.places.length}곳`,
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const data = await LoadSharePageData(id);

  if (!data) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${protocol}://${host}/share/${id}`;

  return (
    <SHARE_BASIC_01
      profile={data.profile}
      places={data.places}
      shareUrl={shareUrl}
    />
  );
}
