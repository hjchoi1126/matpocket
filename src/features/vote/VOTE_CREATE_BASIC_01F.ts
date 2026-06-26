"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { CreateVoteLogic1 } from "@/features/vote/VoteLogic1";
import type { Place } from "@/types/place";

export function useVoteCreateBasic01F() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("이번 주 회식 어디로?");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const LoadPlaces = useCallback(async () => {
    setIsLoading(true);
    const result = await LoadPlacesLogic1();
    setPlaces(result.places);
    setErrorMessage(result.error ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void LoadPlaces();
  }, [LoadPlaces]);

  const TogglePlace = useCallback((placeId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
  }, []);

  const HandleCreateVote = useCallback(async () => {
    if (selectedIds.size < 2) {
      setErrorMessage("투표 후보 맛집을 2곳 이상 선택해 주세요.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    const result = await CreateVoteLogic1({
      title: title.trim() || "이번 주 회식 어디로?",
      placeIds: Array.from(selectedIds),
    });

    setIsCreating(false);

    if (result.error || !result.voteRoom) {
      setErrorMessage(result.error ?? "투표방 생성에 실패했습니다.");
      return;
    }

    router.push(`/vote/${result.voteRoom.id}`);
  }, [router, selectedIds, title]);

  return {
    places,
    selectedIds,
    title,
    setTitle,
    isLoading,
    isCreating,
    errorMessage,
    TogglePlace,
    HandleCreateVote,
  };
}
