"use client";

import { useCallback, useEffect, useState } from "react";
import { CastVoteLogic1, LoadVoteLogic1 } from "@/features/vote/VoteLogic1";
import type { VoteRoom } from "@/types/vote";

export function useVoteBasic01F(voteRoomId: string) {
  const [voteRoom, setVoteRoom] = useState<VoteRoom | null>(null);
  const [voterName, setVoterName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const LoadVote = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }

      const result = await LoadVoteLogic1(voteRoomId);
      setVoteRoom(result.voteRoom ?? null);
      setErrorMessage(result.error ?? null);

      if (!options?.silent) {
        setIsLoading(false);
      }
    },
    [voteRoomId],
  );

  useEffect(() => {
    void LoadVote();
  }, [LoadVote]);

  useEffect(() => {
    const interval = setInterval(() => {
      void LoadVoteLogic1(voteRoomId).then((result) => {
        if (result.voteRoom) {
          setVoteRoom(result.voteRoom);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [voteRoomId]);

  const HandleVote = useCallback(
    async (voteOptionId: number) => {
      setIsVoting(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const result = await CastVoteLogic1(
        voteRoomId,
        voteOptionId,
        voterName || undefined,
      );

      setIsVoting(false);

      if (result.error || !result.voteRoom) {
        setErrorMessage(result.error ?? "투표에 실패했습니다.");
        return;
      }

      setVoteRoom(result.voteRoom);
      setStatusMessage("투표가 반영되었습니다!");
    },
    [voteRoomId, voterName],
  );

  const HandleCopyLink = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/vote/${voteRoomId}`
        : "";

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("링크 복사에 실패했습니다.");
    }
  }, [voteRoomId]);

  return {
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
  };
}
