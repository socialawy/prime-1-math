import type { GuidedBoxProblem } from "../../types/curriculum";

export function generateMake10Addition(
  addendA: number,
  addendB: number,
  splitTarget: "A" | "B" = "B",
): GuidedBoxProblem {
  const target = splitTarget === "B" ? addendB : addendA;
  const other = splitTarget === "B" ? addendA : addendB;
  const give = 10 - other;
  const keep = target - give;
  const sum = addendA + addendB;

  return {
    type: "addition",
    equation: `${addendA} + ${addendB}`,
    steps: [
      {
        id: "s1",
        template: `${other} needs {0} more to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: false,
      },
      {
        id: "s2",
        template: `Split ${target} into {0} and {1}`,
        blanks: [
          { index: 0, correctValue: give },
          { index: 1, correctValue: keep },
        ],
        revealAfterPrevious: true,
      },
      {
        id: "s3",
        template: `Add {0} to ${other} to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: true,
      },
      {
        id: "s4",
        template: `10 and {0} make {1}`,
        blanks: [
          { index: 0, correctValue: keep },
          { index: 1, correctValue: sum },
        ],
        revealAfterPrevious: true,
      },
    ],
    finalAnswer: sum,
  };
}

export function generateUse10Subtraction(
  minuend: number,
  subtrahend: number,
): GuidedBoxProblem {
  const dropTo10 = minuend - 10;
  const remaining = subtrahend - dropTo10;
  const result = 10 - remaining;

  return {
    type: "subtraction",
    equation: `${minuend} - ${subtrahend}`,
    steps: [
      {
        id: "s1",
        template: `${minuend} needs to go down to 10. Split ${subtrahend} into {0} and {1}.`,
        blanks: [
          { index: 0, correctValue: dropTo10 },
          { index: 1, correctValue: remaining },
        ],
        revealAfterPrevious: false,
      },
      {
        id: "s2",
        template: `${minuend} - {0} = 10`,
        blanks: [{ index: 0, correctValue: dropTo10 }],
        revealAfterPrevious: true,
      },
      {
        id: "s3",
        template: `10 - {0} = {1}`,
        blanks: [
          { index: 0, correctValue: remaining },
          { index: 1, correctValue: result },
        ],
        revealAfterPrevious: true,
      },
    ],
    finalAnswer: result,
  };
}

export function generateAllMake10Problems(): GuidedBoxProblem[] {
  const problems: GuidedBoxProblem[] = [];
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a + b > 10 && a + b <= 18) {
        // Split the smaller number (book's "First Way")
        if (a >= b) problems.push(generateMake10Addition(a, b, "B"));
        else problems.push(generateMake10Addition(a, b, "A"));
      }
    }
  }
  return problems;
}

export function generateAllUse10Problems(): GuidedBoxProblem[] {
  const problems: GuidedBoxProblem[] = [];
  for (let minuend = 11; minuend <= 18; minuend++) {
    for (let sub = 2; sub <= 9; sub++) {
      if (minuend - sub >= 2 && sub > minuend - 10) {
        problems.push(generateUse10Subtraction(minuend, sub));
      }
    }
  }
  return problems;
}
