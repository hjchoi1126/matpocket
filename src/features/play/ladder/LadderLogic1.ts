export type LadderMatrix = boolean[][];

export const DEFAULT_LADDER_RESULTS = [
  "오늘 독박",
  "면제",
  "커피쏘기",
  "2차담당",
];

export function GetLadderColumnCountLogic1(
  participantCount: number,
  resultCount: number,
): number {
  return Math.max(participantCount, resultCount, 2);
}

export function GenerateLadderMatrixLogic1(
  columnCount: number,
  rowCount = 12,
): LadderMatrix {
  if (columnCount < 2) {
    return [];
  }

  const bridgeCount = columnCount - 1;
  const matrix: LadderMatrix = [];

  for (let row = 0; row < rowCount; row += 1) {
    const bridges = Array.from({ length: bridgeCount }, () => false);
    const maxBridges = Math.min(2, bridgeCount);

    let placed = 0;
    let column = 0;

    while (column < bridgeCount && placed < maxBridges) {
      if (Math.random() > 0.55) {
        if (column > 0 && bridges[column - 1]) {
          column += 1;
          continue;
        }
        bridges[column] = true;
        placed += 1;
        column += 2;
        continue;
      }
      column += 1;
    }

    matrix.push(bridges);
  }

  return matrix;
}

export function TraceLadderResultLogic1(
  startColumn: number,
  matrix: LadderMatrix,
): number {
  let column = startColumn;

  matrix.forEach((bridges) => {
    if (column > 0 && bridges[column - 1]) {
      column -= 1;
      return;
    }
    if (column < bridges.length && bridges[column]) {
      column += 1;
    }
  });

  return column;
}

export function BuildLadderResultsLogic1(
  participantCount: number,
  customResults?: string[],
): string[] {
  const source = customResults?.length
    ? customResults
    : DEFAULT_LADDER_RESULTS;

  const columnCount = GetLadderColumnCountLogic1(
    participantCount,
    source.length,
  );

  return Array.from({ length: columnCount }, (_, index) => {
    return source[index] ?? "";
  });
}
