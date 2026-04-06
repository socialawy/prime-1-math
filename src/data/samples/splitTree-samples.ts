import type { SplitTreeProblem } from "../../types/curriculum";

export const SPLIT_SAMPLES: SplitTreeProblem[] = [
  // Addition — easy (split small number off 9)
  {
    mode: "addition",
    numberA: 9,
    numberB: 4,
    allowSplitChoice: true,
    expectedAnswer: 13,
  },
  {
    mode: "addition",
    numberA: 8,
    numberB: 5,
    allowSplitChoice: true,
    expectedAnswer: 13,
  },

  // Addition — medium (split off 7 or 8)
  {
    mode: "addition",
    numberA: 7,
    numberB: 6,
    allowSplitChoice: true,
    expectedAnswer: 13,
  },

  // Subtraction — easy
  {
    mode: "subtraction",
    numberA: 13,
    numberB: 4,
    allowSplitChoice: false,
    presetSplit: "B",
    expectedAnswer: 9,
  },

  // Subtraction — medium
  {
    mode: "subtraction",
    numberA: 14,
    numberB: 6,
    allowSplitChoice: true,
    expectedAnswer: 8,
  },
];
