import { NextResponse } from "next/server";
import { CreateSupabaseServerClient } from "@/lib/supabaseServer";
import { BuildVoteRoomResponse } from "@/lib/voteServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type BallotBody = {
  voteOptionId?: number;
  voterToken?: string;
  voterName?: string | null;
};

export async function POST(request: Request, context: RouteContext) {
  const { id: voteRoomId } = await context.params;

  let body: BallotBody;
  try {
    body = (await request.json()) as BallotBody;
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const voteOptionId = body.voteOptionId;
  const voterToken = body.voterToken?.trim();

  if (!voteOptionId || !voterToken) {
    return NextResponse.json(
      { error: "투표 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const supabase = CreateSupabaseServerClient();

  const { data: option, error: optionError } = await supabase
    .from("vote_options")
    .select("id")
    .eq("id", voteOptionId)
    .eq("vote_room_id", voteRoomId)
    .maybeSingle();

  if (optionError || !option) {
    return NextResponse.json(
      { error: "유효하지 않은 투표 후보입니다." },
      { status: 422 },
    );
  }

  const { error: ballotError } = await supabase.from("vote_ballots").upsert(
    {
      vote_room_id: voteRoomId,
      vote_option_id: voteOptionId,
      voter_token: voterToken,
      voter_name: body.voterName?.trim() || null,
    },
    { onConflict: "vote_room_id,voter_token" },
  );

  if (ballotError) {
    console.error("vote_ballots upsert failed:", ballotError);
    return NextResponse.json(
      {
        error: "투표 저장에 실패했습니다.",
        detail: ballotError.message,
      },
      { status: 500 },
    );
  }

  return BuildVoteRoomResponse(voteRoomId, voterToken);
}
