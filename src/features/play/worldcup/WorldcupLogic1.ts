import type { Place } from "@/types/place";

export function ShufflePlacesLogic1(places: Place[]): Place[] {
  const copied = [...places];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex]!, copied[index]!];
  }

  return copied;
}

export function BuildWorldcupQueueLogic1(places: Place[]): Place[] {
  return ShufflePlacesLogic1(places);
}

export function PopNextMatchupLogic1(
  queue: Place[],
): { matchup: [Place, Place]; remaining: Place[] } | null {
  if (queue.length < 2) {
    return null;
  }

  const [left, right, ...rest] = queue;
  if (!left || !right) {
    return null;
  }

  return {
    matchup: [left, right],
    remaining: rest,
  };
}

export function ResolveByeLogic1(queue: Place[]): {
  queue: Place[];
  autoWinner: Place | null;
} {
  if (queue.length % 2 === 0) {
    return { queue, autoWinner: null };
  }

  const [byeWinner, ...rest] = queue;
  return {
    queue: rest,
    autoWinner: byeWinner ?? null,
  };
}
