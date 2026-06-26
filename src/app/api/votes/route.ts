import { NextResponse } from "next/server";
import { CreateSupabaseServerClient } from "@/lib/supabaseServer";
import { BuildVoteRoomResponse } from "@/lib/voteServer";

type CreateVoteBody = {
  title?: string;
  placeIds?: number[];
  creatorUserId?: string | null;
};

export async function POST(request: Request) {
  let body: CreateVoteBody;

  try {
    body = (await request.json()) as CreateVoteBody;
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const placeIds = body.placeIds?.filter((id) => Number.isFinite(id)) ?? [];
  const title = body.title?.trim() || "이번 주 회식 어디로?";

  if (placeIds.length < 2) {
    return NextResponse.json(
      { error: "투표 후보 맛집을 2곳 이상 선택해 주세요." },
      { status: 400 },
    );
  }

  const supabase = CreateSupabaseServerClient();

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select("id, place_name, address, category")
    .in("id", placeIds);

  if (placesError || !places || places.length < 2) {
    return NextResponse.json(
      { error: "선택한 맛집 정보를 불러오지 못했습니다." },
      { status: 422 },
    );
  }

  const { data: room, error: roomError } = await supabase
    .from("vote_rooms")
    .insert({
      title,
      creator_user_id: body.creatorUserId ?? null,
    })
    .select()
    .single();

  if (roomError || !room) {
    return NextResponse.json(
      { error: "투표방 생성에 실패했습니다." },
      { status: 500 },
    );
  }

  const optionRows = places.map((place) => ({
    vote_room_id: room.id,
    place_id: place.id,
    place_name: place.place_name,
    place_address: place.address,
    category: place.category,
  }));

  const { error: optionsError } = await supabase
    .from("vote_options")
    .insert(optionRows);

  if (optionsError) {
    return NextResponse.json(
      { error: "투표 후보 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return BuildVoteRoomResponse(room.id);
}
