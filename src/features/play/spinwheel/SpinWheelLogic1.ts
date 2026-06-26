export const DEFAULT_SPIN_WHEEL_ITEMS = [
  "오늘 독박",
  "면제",
  "커피쏘기",
  "2차담당",
];

export const SPIN_WHEEL_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A78BFA",
  "#F472B6",
  "#60A5FA",
  "#34D399",
  "#FB923C",
  "#818CF8",
  "#FBBF24",
  "#2DD4BF",
  "#F87171",
];

export function PickSpinWheelIndexLogic1(itemCount: number): number {
  if (itemCount <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * itemCount);
}

export function CalcSpinWheelRotationLogic1(
  itemCount: number,
  winningIndex: number,
  currentRotation: number,
): number {
  const sliceAngle = 360 / itemCount;
  const jitter = (Math.random() - 0.5) * (sliceAngle * 0.3);
  const segmentCenter = winningIndex * sliceAngle + sliceAngle / 2;
  const pointerOffset = segmentCenter + jitter;
  const targetMod = (360 - pointerOffset + 360) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const extraSpins = (4 + Math.floor(Math.random() * 3)) * 360;
  let delta = targetMod - currentMod;

  if (delta <= 0) {
    delta += 360;
  }

  return currentRotation + extraSpins + delta;
}

export function GetSpinWheelIndexFromRotationLogic1(
  itemCount: number,
  rotationDegrees: number,
): number {
  if (itemCount <= 0) {
    return 0;
  }

  const sliceAngle = 360 / itemCount;
  const normalized = ((rotationDegrees % 360) + 360) % 360;
  const pointerOffset = (360 - normalized) % 360;
  const index = Math.floor(pointerOffset / sliceAngle) % itemCount;

  return index;
}

export function GetSpinWheelColorLogic1(index: number): string {
  return SPIN_WHEEL_COLORS[index % SPIN_WHEEL_COLORS.length] ?? "#94A3B8";
}
