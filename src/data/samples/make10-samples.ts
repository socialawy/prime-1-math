import type { GuidedBoxProblem } from "../../types/curriculum";

export const SAMPLE_ADD_5_8: GuidedBoxProblem = {
  type: "addition",
  equation: "5 + 8",
  steps: [
    {
      id: "s1",
      template: "5 needs {0} more to make 10.",
      blanks: [{ index: 0, correctValue: 5, hint: "What plus 5 equals 10?" }],
      revealAfterPrevious: false,
    },
    {
      id: "s2",
      template: "Split 8 into {0} and {1}",
      blanks: [
        { index: 0, correctValue: 5 },
        { index: 1, correctValue: 3 },
      ],
      revealAfterPrevious: true,
    },
    {
      id: "s3",
      template: "Add {0} to 5 to make 10.",
      blanks: [{ index: 0, correctValue: 5 }],
      revealAfterPrevious: true,
    },
    {
      id: "s4",
      template: "10 and {0} make {1}",
      blanks: [
        { index: 0, correctValue: 3 },
        { index: 1, correctValue: 13 },
      ],
      revealAfterPrevious: true,
    },
  ],
  finalAnswer: 13,
};

export const SAMPLE_SUB_14_6: GuidedBoxProblem = {
  type: "subtraction",
  equation: "14 - 6",
  steps: [
    {
      id: "s1",
      template: "14 needs to go down to 10. Split 6 into {0} and {1}.",
      blanks: [
        { index: 0, correctValue: 4, hint: "14 minus what equals 10?" },
        { index: 1, correctValue: 2 },
      ],
      revealAfterPrevious: false,
    },
    {
      id: "s2",
      template: "14 - {0} = 10",
      blanks: [{ index: 0, correctValue: 4 }],
      revealAfterPrevious: true,
    },
    {
      id: "s3",
      template: "10 - {0} = {1}",
      blanks: [
        { index: 0, correctValue: 2 },
        { index: 1, correctValue: 8 },
      ],
      revealAfterPrevious: true,
    },
  ],
  finalAnswer: 8,
};

/** 14 - 6, Method A: split the minuend (book's "By spliting the greater number") */
export const SAMPLE_SUB_14_6_METHOD_A: GuidedBoxProblem = {
  type: "subtraction",
  equation: "14 - 6",
  steps: [
    {
      id: "s1",
      template: "You cannot subtract 6 from 4.",
      blanks: [],                              // info-only: auto-advances
      revealAfterPrevious: false,
    },
    {
      id: "s2",
      template: "Split 14 into {0} and {1}",
      blanks: [
        { index: 0, correctValue: 10 },
        { index: 1, correctValue: 4 },
      ],
      revealAfterPrevious: true,
    },
    {
      id: "s3",
      template: "Subtract 6 from 10 to get {0}",
      blanks: [{ index: 0, correctValue: 4 }],
      revealAfterPrevious: true,
    },
    {
      id: "s4",
      template: "{0} and {1} make {2}",
      blanks: [
        { index: 0, correctValue: 4 },
        { index: 1, correctValue: 4 },
        { index: 2, correctValue: 8 },
      ],
      revealAfterPrevious: true,
    },
  ],
  finalAnswer: 8,
};

export const ALL_SAMPLES: GuidedBoxProblem[] = [
  SAMPLE_ADD_5_8,
  SAMPLE_SUB_14_6,
  SAMPLE_SUB_14_6_METHOD_A,
];
