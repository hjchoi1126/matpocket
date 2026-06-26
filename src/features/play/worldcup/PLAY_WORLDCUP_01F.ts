"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadPlacesLogic1 } from "@/features/home/SavePlaceLogic1";
import { BuildWorldcupQueueLogic1 } from "@/features/play/worldcup/WorldcupLogic1";
import type { Place } from "@/types/place";

type WorldcupPhase = "setup" | "playing" | "done";

function GetRoundLabelLogic1(count: number): string {
  if (count <= 2) return "결승";
  if (count <= 4) return "4강";
  if (count <= 8) return "8강";
  return "16강";
}

export function usePlayWorldcup01F() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<WorldcupPhase>("setup");
  const [participants, setParticipants] = useState<Place[]>([]);
  const [roundWinners, setRoundWinners] = useState<Place[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [currentMatch, setCurrentMatch] = useState<[Place, Place] | null>(null);
  const [champion, setChampion] = useState<Place | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    void LoadPlacesLogic1().then((result) => {
      setPlaces(result.places);
      setSelectedIds(new Set(result.places.map((place) => place.id)));
      setIsLoading(false);
    });
  }, []);

  const selectedPlaces = useMemo(
    () => places.filter((place) => selectedIds.has(place.id)),
    [places, selectedIds],
  );

  const roundLabel = GetRoundLabelLogic1(
    participants.length > 0 ? participants.length : selectedPlaces.length,
  );

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

  const StartRoundLogic1 = useCallback((list: Place[]) => {
    const shuffled = BuildWorldcupQueueLogic1(list);
    const working = [...shuffled];
    const byeWinners: Place[] = [];

    if (working.length % 2 === 1) {
      const bye = working.pop();
      if (bye) {
        byeWinners.push(bye);
      }
    }

    setParticipants(working);
    setRoundWinners(byeWinners);
    setPairIndex(0);

    if (working.length >= 2) {
      setCurrentMatch([working[0]!, working[1]!]);
      setStatusMessage(
        byeWinners[0]
          ? `부전승: ${byeWinners[0].place_name}`
          : null,
      );
    } else if (working.length === 1 && byeWinners.length > 0) {
      setChampion(working[0]!);
      setPhase("done");
      setCurrentMatch(null);
    }
  }, []);

  const HandleStart = useCallback(() => {
    if (selectedPlaces.length < 2) {
      setStatusMessage("최소 2곳 이상 선택해 주세요.");
      return;
    }

    setPhase("playing");
    setChampion(null);
    setStatusMessage(null);
    StartRoundLogic1(selectedPlaces);
  }, [selectedPlaces, StartRoundLogic1]);

  const HandlePickWinner = useCallback(
    (winner: Place) => {
      const nextWinners = [...roundWinners, winner];
      const nextIndex = pairIndex + 2;

      if (nextIndex < participants.length) {
        setRoundWinners(nextWinners);
        setPairIndex(nextIndex);
        setCurrentMatch([
          participants[nextIndex]!,
          participants[nextIndex + 1]!,
        ]);
        setStatusMessage(null);
        return;
      }

      if (nextWinners.length === 1) {
        setChampion(nextWinners[0] ?? null);
        setPhase("done");
        setCurrentMatch(null);
        setStatusMessage(null);
        return;
      }

      StartRoundLogic1(nextWinners);
    },
    [pairIndex, participants, roundWinners, StartRoundLogic1],
  );

  const HandleReset = useCallback(() => {
    setPhase("setup");
    setParticipants([]);
    setRoundWinners([]);
    setPairIndex(0);
    setCurrentMatch(null);
    setChampion(null);
    setStatusMessage(null);
  }, []);

  return {
    places,
    isLoading,
    selectedIds,
    selectedPlaces,
    phase,
    currentMatch,
    champion,
    roundLabel,
    statusMessage,
    TogglePlace,
    HandleStart,
    HandlePickWinner,
    HandleReset,
  };
}
