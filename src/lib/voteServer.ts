import { NextResponse } from "next/server";
import { CreateSupabaseServerClient } from "@/lib/supabaseServer";
import type { VoteOption, VoteRoom } from "@/types/vote";

export async function BuildVoteRoomResponse(
  voteRoomId: string,
  voterToken?: string | null,
): Promise<NextResponse> {
  const supabase = CreateSupabaseServerClient();

  const { data: room, error: roomError } = await supabase
    .from("vote_rooms")
    .select("*")
    .eq("id", voteRoomId)
    .maybeSingle();

  if (roomError || !room) {
    return NextResponse.json(
      { error: "투표방을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { data: options, error: optionsError } = await supabase
    .from("vote_options")
    .select("*")
    .eq("vote_room_id", voteRoomId)
    .order("id", { ascending: true });

  if (optionsError) {
    return NextResponse.json(
      { error: "투표 후보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }

  const { data: ballots, error: ballotsError } = await supabase
    .from("vote_ballots")
    .select("vote_option_id, voter_token")
    .eq("vote_room_id", voteRoomId);

  if (ballotsError) {
    return NextResponse.json(
      { error: "투표 현황을 불러오지 못했습니다." },
      { status: 500 },
    );
  }

  const countMap = new Map<number, number>();
  (ballots ?? []).forEach((ballot) => {
    const current = countMap.get(ballot.vote_option_id) ?? 0;
    countMap.set(ballot.vote_option_id, current + 1);
  });

  const enrichedOptions: VoteOption[] = (options ?? []).map((option) => ({
    id: option.id,
    vote_room_id: option.vote_room_id,
    place_id: option.place_id,
    place_name: option.place_name,
    place_address: option.place_address,
    category: option.category,
    vote_count: countMap.get(option.id) ?? 0,
  }));

  const totalVotes = enrichedOptions.reduce(
    (sum, option) => sum + option.vote_count,
    0,
  );

  let myVoteOptionId: number | null = null;
  if (voterToken) {
    const myBallot = (ballots ?? []).find(
      (ballot) => ballot.voter_token === voterToken,
    );
    myVoteOptionId = myBallot?.vote_option_id ?? null;
  }

  const response: VoteRoom = {
    id: room.id,
    title: room.title,
    creator_user_id: room.creator_user_id,
    created_at: room.created_at,
    options: enrichedOptions,
    total_votes: totalVotes,
    my_vote_option_id: myVoteOptionId,
  };

  return NextResponse.json(response);
}
