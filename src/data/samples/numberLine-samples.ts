import type { NumberLineData } from "../../types/curriculum";
import { generateNumberLine } from "../../lib/generators/numberLineGenerator";

export const SAMPLE_NUMBER_LINE_BY_2: NumberLineData = {
  type: "place-value-number-line",
  rangeStart: 0,
  rangeEnd: 14,
  jumpSize: 2,
  markedPoints: [0, 2, 4, 8, 12, 14],
  missingPoints: [6, 10],
  showJumpArrows: true,
};

export const SAMPLE_NUMBER_LINE_BY_5: NumberLineData = {
  type: "place-value-number-line",
  rangeStart: 0,
  rangeEnd: 50,
  jumpSize: 5,
  markedPoints: [0, 5, 15, 20, 30, 35, 45, 50],
  missingPoints: [10, 25, 40],
  showJumpArrows: true,
};

export const SAMPLE_NUMBER_LINE_BY_10: NumberLineData = {
  type: "place-value-number-line",
  rangeStart: 0,
  rangeEnd: 100,
  jumpSize: 10,
  markedPoints: [0, 10, 20, 40, 60, 70, 90, 100],
  missingPoints: [30, 50, 80],
  showJumpArrows: true,
};

export const RANDOM_NUMBER_LINES: NumberLineData[] = [
  generateNumberLine(2, 1),
  generateNumberLine(5, 2),
  generateNumberLine(10, 3),
];
