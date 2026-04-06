import type { NumberLineData } from "../../types/curriculum";

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < count && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

export function generateNumberLine(
  jumpSize: 1 | 2 | 5 | 10,
  difficulty: 1 | 2 | 3,
): NumberLineData {
  const maxEnd = jumpSize === 1 ? 20 : jumpSize === 2 ? 30 : 100;
  const start = 0;
  const end = difficulty === 1 ? maxEnd / 2 : maxEnd;
  const allPoints: number[] = [];

  for (let value = start; value <= end; value += jumpSize) {
    allPoints.push(value);
  }

  const blankCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 5;
  const blankable = allPoints.slice(1, -1);
  const missingPoints = pickRandom(
    blankable,
    Math.min(blankCount, blankable.length),
  ).sort((a, b) => a - b);

  return {
    type: "place-value-number-line",
    rangeStart: start,
    rangeEnd: end,
    jumpSize,
    missingPoints,
    markedPoints: allPoints.filter((point) => !missingPoints.includes(point)),
    showJumpArrows: true,
  };
}
