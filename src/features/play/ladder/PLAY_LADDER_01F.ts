"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BuildLadderResultsLogic1,
  DEFAULT_LADDER_RESULTS,
  GenerateLadderMatrixLogic1,
  TraceLadderResultLogic1,
  type LadderMatrix,
} from "@/features/play/ladder/LadderLogic1";

type LadderPhase = "setup" | "ready" | "result";

export function usePlayLadder01F() {
  const [participants, setParticipants] = useState<string[]>([
    "민수",
    "지영",
    "철수",
    "수진",
  ]);
  const [newName, setNewName] = useState("");
  const [phase, setPhase] = useState<LadderPhase>("setup");
  const [matrix, setMatrix] = useState<LadderMatrix>([]);
  const [bottomResults, setBottomResults] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<
    Array<{ name: string; result: string }>
  >([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const AddParticipant = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setParticipants((prev) => {
      if (prev.includes(trimmed) || prev.length >= 8) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setNewName("");
  }, [newName]);

  const RemoveParticipant = useCallback((name: string) => {
    setParticipants((prev) => prev.filter((item) => item !== name));
  }, []);

  const HandleGenerate = useCallback(() => {
    if (participants.length < 2) {
      setStatusMessage("최소 2명 이상 등록해 주세요.");
      return;
    }

    const nextMatrix = GenerateLadderMatrixLogic1(participants.length);
    const results = BuildLadderResultsLogic1(
      participants.length,
      DEFAULT_LADDER_RESULTS,
    );

    setMatrix(nextMatrix);
    setBottomResults(results);
    setPhase("ready");
    setOutcomes([]);
    setStatusMessage(null);
  }, [participants]);

  const HandleReveal = useCallback(() => {
    if (matrix.length === 0) {
      return;
    }

    const mapped = participants.map((name, index) => {
      const resultIndex = TraceLadderResultLogic1(index, matrix);
      return {
        name,
        result: bottomResults[resultIndex] ?? "결과",
      };
    });

    setOutcomes(mapped);
    setPhase("result");
  }, [bottomResults, matrix, participants]);

  const HandleReset = useCallback(() => {
    setPhase("setup");
    setMatrix([]);
    setBottomResults([]);
    setOutcomes([]);
    setStatusMessage(null);
  }, []);

  const ladderHeight = useMemo(() => matrix.length, [matrix.length]);

  return {
    participants,
    newName,
    setNewName,
    phase,
    matrix,
    bottomResults,
    outcomes,
    ladderHeight,
    statusMessage,
    AddParticipant,
    RemoveParticipant,
    HandleGenerate,
    HandleReveal,
    HandleReset,
  };
}
