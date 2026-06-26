export const DEFAULT_BOMB_PARTICIPANTS = ["민수", "지영", "철수", "수진"];

export function PickBombVictimLogic1(participants: string[]): string {
  const valid = participants.map((name) => name.trim()).filter(Boolean);
  if (valid.length === 0) {
    return "독박 당첨자";
  }

  const index = Math.floor(Math.random() * valid.length);
  return valid[index]!;
}

export function NormalizeParticipantLogic1(name: string): string {
  return name.trim();
}
