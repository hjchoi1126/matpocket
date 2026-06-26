"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BuildLadderResultsLogic1,
  DEFAULT_LADDER_RESULTS,
  GenerateLadderMatrixLogic1,
  GetLadderColumnCountLogic1,
  TraceLadderResultLogic1,
  type LadderMatrix,
} from "@/features/play/ladder/LadderLogic1";

type LadderPhase = "setup" | "results" | "ready" | "result";

export function usePlayLadder01F() {
  const [participants, setParticipants] = useState<string[]>([
    "민수",
    "지영",
    "철수",
    "수진",
  ]);
  const [newName, setNewName] = useState("");
  const [ladderResults, setLadderResults] = useState<string[]>([
    ...DEFAULT_LADDER_RESULTS,
  ]);
  const [newResult, setNewResult] = useState("");
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

  const UpdateResult = useCallback((index: number, value: string) => {
    setLadderResults((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }, []);

  const RemoveResult = useCallback((index: number) => {
    setLadderResults((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }, []);

  const AddResult = useCallback(() => {
    const trimmed = newResult.trim();
    if (!trimmed) return;

    setLadderResults((prev) => {
      if (prev.includes(trimmed) || prev.length >= 12) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setNewResult("");
  }, [newResult]);

  const HandleGenerate = useCallback(() => {
    if (participants.length < 2) {
      setStatusMessage("최소 2명 이상 등록해 주세요.");
      return;
    }

    setStatusMessage(null);
    setPhase("results");
  }, [participants.length]);

  const HandleBuildLadder = useCallback(() => {
    const trimmedResults = ladderResults
      .map((item) => item.trim())
      .filter(Boolean);

    if (trimmedResults.length === 0) {
      setStatusMessage("결과 항목을 최소 1개 이상 입력해 주세요.");
      return;
    }

    const columnCount = GetLadderColumnCountLogic1(
      participants.length,
      trimmedResults.length,
    );
    const nextMatrix = GenerateLadderMatrixLogic1(columnCount);
    const results = BuildLadderResultsLogic1(
      participants.length,
      trimmedResults,
    );

    setLadderResults(trimmedResults);
    setMatrix(nextMatrix);
    setBottomResults(results);
    setPhase("ready");
    setOutcomes([]);
    setStatusMessage(null);
  }, [ladderResults, participants.length]);

  const HandleBackToSetup = useCallback(() => {
    setPhase("setup");
    setStatusMessage(null);
  }, []);

  const HandleReveal = useCallback(() => {
    if (matrix.length === 0) {
      return;
    }

    const mapped = participants.map((name, index) => {
      const resultIndex = TraceLadderResultLogic1(index, matrix);
      const resultLabel = bottomResults[resultIndex]?.trim();
      return {
        name,
        result: resultLabel || "결과 없음",
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

  const columnCount = useMemo(
    () => Math.max(participants.length, bottomResults.length),
    [participants.length, bottomResults.length],
  );

  return {
    participants,
    newName,
    setNewName,
    ladderResults,
    newResult,
    setNewResult,
    phase,
    matrix,
    bottomResults,
    columnCount,
    outcomes,
    ladderHeight,
    statusMessage,
    AddParticipant,
    RemoveParticipant,
    UpdateResult,
    RemoveResult,
    AddResult,
    HandleGenerate,
    HandleBuildLadder,
    HandleBackToSetup,
    HandleReveal,
    HandleReset,
  };
}
