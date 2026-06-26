"use client";

import { useCallback, useState } from "react";
import {
  CalcSpinWheelRotationLogic1,
  DEFAULT_SPIN_WHEEL_ITEMS,
  GetSpinWheelIndexFromRotationLogic1,
  PickSpinWheelIndexLogic1,
} from "@/features/play/spinwheel/SpinWheelLogic1";

export function usePlaySpinWheel01F() {
  const [items, setItems] = useState<string[]>([...DEFAULT_SPIN_WHEEL_ITEMS]);
  const [newItem, setNewItem] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const UpdateItem = useCallback((index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
    setWinner(null);
  }, []);

  const RemoveItem = useCallback((index: number) => {
    setItems((prev) => {
      if (prev.length <= 2) {
        return prev;
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
    setWinner(null);
  }, []);

  const AddItem = useCallback(() => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    setItems((prev) => {
      if (prev.includes(trimmed) || prev.length >= 12) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setNewItem("");
    setWinner(null);
  }, [newItem]);

  const HandleSpin = useCallback(() => {
    const trimmedItems = items.map((item) => item.trim()).filter(Boolean);

    if (trimmedItems.length < 2) {
      setStatusMessage("돌림판 항목을 2개 이상 입력해 주세요.");
      return;
    }

    if (isSpinning) {
      return;
    }

    setStatusMessage(null);
    setWinner(null);
    setIsSpinning(true);

    const winningIndex = PickSpinWheelIndexLogic1(trimmedItems.length);
    const nextRotation = CalcSpinWheelRotationLogic1(
      trimmedItems.length,
      winningIndex,
      rotation,
    );

    setRotation(nextRotation);

    window.setTimeout(() => {
      const resultIndex = GetSpinWheelIndexFromRotationLogic1(
        trimmedItems.length,
        nextRotation,
      );
      setWinner(trimmedItems[resultIndex] ?? null);
      setIsSpinning(false);
    }, 4200);
  }, [isSpinning, items, rotation]);

  return {
    items,
    newItem,
    setNewItem,
    rotation,
    isSpinning,
    winner,
    statusMessage,
    UpdateItem,
    RemoveItem,
    AddItem,
    HandleSpin,
  };
}
