import { GetVoterToken } from "@/lib/voterToken";
import { GetLocalUserId } from "@/lib/userId";
import type { VoteRoom } from "@/types/vote";

type CreateVotePayload = {
  title: string;
  placeIds: number[];
};

export async function CreateVoteLogic1(
  payload: CreateVotePayload,
): Promise<{ voteRoom?: VoteRoom; error?: string }> {
  try {
    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        creatorUserId: GetLocalUserId() || null,
      }),
    });

    const data = (await response.json()) as VoteRoom & { error?: string };

    if (!response.ok) {
      return { error: data.error ?? "투표방 생성에 실패했습니다." };
    }

    return { voteRoom: data };
  } catch {
    return { error: "투표방 생성 중 오류가 발생했습니다." };
  }
}

export async function LoadVoteLogic1(
  voteRoomId: string,
): Promise<{ voteRoom?: VoteRoom; error?: string }> {
  try {
    const voterToken = GetVoterToken();
    const params = voterToken
      ? `?voterToken=${encodeURIComponent(voterToken)}`
      : "";

    const response = await fetch(`/api/votes/${voteRoomId}${params}`);
    const data = (await response.json()) as VoteRoom & { error?: string };

    if (!response.ok) {
      return { error: data.error ?? "투표방을 불러오지 못했습니다." };
    }

    return { voteRoom: data };
  } catch {
    return { error: "투표방 조회 중 오류가 발생했습니다." };
  }
}

export async function CastVoteLogic1(
  voteRoomId: string,
  voteOptionId: number,
  voterName?: string,
): Promise<{ voteRoom?: VoteRoom; error?: string }> {
  try {
    const response = await fetch(`/api/votes/${voteRoomId}/ballot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voteOptionId,
        voterToken: GetVoterToken(),
        voterName: voterName?.trim() || null,
      }),
    });

    const data = (await response.json()) as VoteRoom & { error?: string };

    if (!response.ok) {
      return { error: data.error ?? "투표에 실패했습니다." };
    }

    return { voteRoom: data };
  } catch {
    return { error: "투표 중 오류가 발생했습니다." };
  }
}
