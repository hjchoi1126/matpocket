"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_BOMB_PARTICIPANTS,
  NormalizeParticipantLogic1,
  PickBombVictimLogic1,
} from "@/features/play/roulette/BombRouletteLogic1";

export function usePlayBombRoulette01F() {
  const [participants, setParticipants] = useState<string[]>(
    DEFAULT_BOMB_PARTICIPANTS,
  );
  const [newName, setNewName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [victim, setVictim] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const AddParticipant = useCallback(() => {
    const normalized = NormalizeParticipantLogic1(newName);
    if (!normalized) return;

    setParticipants((prev) => {
      if (prev.includes(normalized)) {
        return prev;
      }
      return [...prev, normalized];
    });
    setNewName("");
  }, [newName]);

  const RemoveParticipant = useCallback((name: string) => {
    setParticipants((prev) => prev.filter((item) => item !== name));
  }, []);

  const HandleSpin = useCallback(() => {
    const valid = participants.map(NormalizeParticipantLogic1).filter(Boolean);

    if (valid.length < 2) {
      setStatusMessage("최소 2명 이상 등록해 주세요.");
      return;
    }

    const finalVictim = PickBombVictimLogic1(valid);
    setIsSpinning(true);
    setVictim(null);
    setStatusMessage(null);

    let tick = 0;
    const maxTicks = 20;

    const intervalId = window.setInterval(() => {
      const randomName = valid[tick % valid.length] ?? "";
      setDisplayName(randomName);
      tick += 1;

      if (tick >= maxTicks) {
        window.clearInterval(intervalId);
        setDisplayName(finalVictim);
        setVictim(finalVictim);
        setIsSpinning(false);
      }
    }, 90);
  }, [participants]);

  return {
    participants,
    newName,
    setNewName,
    displayName,
    victim,
    isSpinning,
    statusMessage,
    AddParticipant,
    RemoveParticipant,
    HandleSpin,
  };
}
