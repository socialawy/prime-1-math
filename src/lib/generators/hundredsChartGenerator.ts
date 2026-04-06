import type { HundredsChartData } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < count && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

export function generateFillMissing(
  count = 5,
  region?: { rowStart: number; rowEnd: number },
): HundredsChartData {
  const min = region ? (region.rowStart - 1) * 10 + 1 : 1;
  const max = region ? region.rowEnd * 10 : 100;
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const missing = pickRandom(pool, Math.min(count, pool.length)).sort(
    (a, b) => a - b,
  );
  return {
    type: "place-value-hundreds-chart",
    mode: "fill-missing",
    missingCells: missing,
  };
}

export function generateJumpBy10(startCol?: number): HundredsChartData {
  // startCol is 1-10 (the column, i.e. ones digit position)
  const col = startCol ?? randomInt(1, 10);
  // Full column: col, col+10, ..., col+90
  const fullCol = Array.from({ length: 10 }, (_, i) => col + i * 10);
  // Blank out 3-4 cells (never the first, never the last — anchors help kids)
  const blankable = fullCol.slice(1, -1);
  const blanks = pickRandom(blankable, randomInt(3, 4)).sort((a, b) => a - b);
  return {
    type: "place-value-hundreds-chart",
    mode: "jump-by-10",
    jumpStart: col,
    jumpDirection: "down",
    preHighlighted: fullCol.filter((n) => !blanks.includes(n)),
    jumpBlanks: blanks,
  };
}

export function generateColorPattern(
  patternType: "multiples-of-10" | "col" | "row" = "multiples-of-10",
  param = 0,
): HundredsChartData {
  let targetCells: number[];
  let patternRule: string;

  if (patternType === "multiples-of-10") {
    targetCells = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    patternRule = "Color all numbers that end in 0 (multiples of 10)";
  } else if (patternType === "col") {
    const col = param || randomInt(1, 9);
    targetCells = Array.from({ length: 10 }, (_, i) => col + i * 10);
    patternRule = `Color the column where the ones digit is ${col}`;
  } else {
    const row = param || randomInt(1, 10);
    const start = (row - 1) * 10 + 1;
    targetCells = Array.from({ length: 10 }, (_, i) => start + i);
    patternRule = `Color all numbers in row ${row} (${start}–${start + 9})`;
  }

  // Pre-highlight half to give a hint
  const preCount = Math.floor(targetCells.length / 2);
  const preHighlighted = targetCells.slice(0, preCount);
  const remaining = targetCells.slice(preCount);

  return {
    type: "place-value-hundreds-chart",
    mode: "color-pattern",
    preHighlighted,
    targetCells: remaining,
    patternRule,
  };
}

export function generateFindNumber(): HundredsChartData {
  const tens = randomInt(1, 9);
  const ones = randomInt(0, 9);
  const answer = tens * 10 + ones;
  return {
    type: "place-value-hundreds-chart",
    mode: "find-number",
    riddle: `I have ${tens} tens and ${ones} ones. Who am I?`,
    correctCell: answer,
  };
}
