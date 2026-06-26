"use client";

import { Check, Copy, Loader2, Share2, Users } from "lucide-react";
import VoteBarChart from "@/components/features/VoteBarChart";
import { useVoteBasic01F } from "@/features/vote/VOTE_BASIC_01F";

type VoteBasic01Props = {
  voteRoomId: string;
};

export default function VOTE_BASIC_01({ voteRoomId }: VoteBasic01Props) {
  const {
    voteRoom,
    voterName,
    setVoterName,
    isLoading,
    isVoting,
    errorMessage,
    statusMessage,
    copied,
    HandleVote,
    HandleCopyLink,
  } = useVoteBasic01F(voteRoomId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (!voteRoom) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm text-gray-500">
          {errorMessage ?? "투표방을 찾을 수 없습니다."}
        </p>
      </div>
    );
  }

  const hasVoted = voteRoom.my_vote_option_id != null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-gray-100 bg-gradient-to-br from-primary/10 to-orange-50 px-4 py-6">
        <p className="flex items-center gap-1 text-xs font-semibold text-primary">
          <Users className="h-3.5 w-3.5" aria-hidden />
          그룹 투표 공유방
        </p>
        <h1 className="mt-2 text-xl font-bold text-gray-900">{voteRoom.title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          총 {voteRoom.total_votes}표 · 가입 없이 바로 투표할 수 있어요
        </p>
        <button
          type="button"
          onClick={() => void HandleCopyLink()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          {copied ? "링크 복사됨!" : "투표 링크 복사"}
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!hasVoted && (
          <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              닉네임 (선택)
            </label>
            <input
              value={voterName}
              onChange={(event) => setVoterName(event.target.value)}
              placeholder="예: 팀장님, 민수"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
            />
          </div>
        )}

        {hasVoted && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            <Share2 className="h-4 w-4" aria-hidden />
            투표 완료! 결과는 실시간으로 갱신됩니다.
          </p>
        )}

        <VoteBarChart
          options={voteRoom.options}
          totalVotes={voteRoom.total_votes}
          selectedOptionId={voteRoom.my_vote_option_id}
          disabled={isVoting || hasVoted}
          onSelect={(optionId) => void HandleVote(optionId)}
        />

        {isVoting && (
          <p className="mt-4 text-center text-sm text-gray-500">투표 반영 중...</p>
        )}

        {statusMessage && (
          <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </main>
    </div>
  );
}
