import type { HundredsChartData } from "../../types/curriculum";

/** fill-missing: blanks in rows 2–3, a mix of positions */
export const SAMPLE_FILL_MISSING: HundredsChartData = {
  type: "place-value-hundreds-chart",
  mode: "fill-missing",
  missingCells: [13, 17, 23, 28, 35],
};

/** jump-by-10: column 3 (3, 13, 23, 33 … 93), some blanks */
export const SAMPLE_JUMP_BY_10: HundredsChartData = {
  type: "place-value-hundreds-chart",
  mode: "jump-by-10",
  jumpStart: 3,
  jumpDirection: "down",
  preHighlighted: [3, 13, 33, 53, 73, 93],
  jumpBlanks: [23, 43, 63, 83],
};

/** color-pattern: multiples of 10, first 5 pre-colored, rest for the child */
export const SAMPLE_COLOR_PATTERN: HundredsChartData = {
  type: "place-value-hundreds-chart",
  mode: "color-pattern",
  preHighlighted: [10, 20, 30, 40, 50],
  targetCells: [60, 70, 80, 90, 100],
  patternRule: "Color all numbers that end in 0",
};

/** find-number: place-value riddle */
export const SAMPLE_FIND_NUMBER: HundredsChartData = {
  type: "place-value-hundreds-chart",
  mode: "find-number",
  riddle: "I have 3 tens and 7 ones. Who am I?",
  correctCell: 37,
};

export const ALL_CHART_SAMPLES: HundredsChartData[] = [
  SAMPLE_FILL_MISSING,
  SAMPLE_JUMP_BY_10,
  SAMPLE_COLOR_PATTERN,
  SAMPLE_FIND_NUMBER,
];
