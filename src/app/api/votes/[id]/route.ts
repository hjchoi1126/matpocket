import { NextResponse } from "next/server";
import { BuildVoteRoomResponse } from "@/lib/voteServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const voterToken = searchParams.get("voterToken");

  return BuildVoteRoomResponse(id, voterToken);
}
