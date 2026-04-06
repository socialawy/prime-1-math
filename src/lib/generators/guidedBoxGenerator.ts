import type { GuidedBoxProblem } from "../../types/curriculum";

// ── Addition ───────────────────────────────────────────

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

// ── Subtraction Method B: split the subtrahend ─────────
// "14 - 6: chip away at the number you're subtracting"
// Split 6 into 4 and 2 → 14 - 4 = 10 → 10 - 2 = 8

export function generateUse10SubtractionMethodB(
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

// ── Subtraction Method A: split the minuend ────────────
// "14 - 8: break your big number into a ten and leftovers"
// Split 14 into 10 and 4 → 10 - 8 = 2 → 2 + 4 = 6

export function generateUse10SubtractionMethodA(
  minuend: number,
  subtrahend: number,
): GuidedBoxProblem {
  const ones = minuend - 10;            // e.g. 14 - 10 = 4
  const subtractedFromTen = 10 - subtrahend; // e.g. 10 - 8 = 2
  const result = subtractedFromTen + ones;   // e.g. 2 + 4 = 6

  return {
    type: "subtraction",
    equation: `${minuend} - ${subtrahend}`,
    steps: [
      {
        id: "s1",
        // Info-only step — no blanks, auto-advances
        template: `You cannot subtract ${subtrahend} from ${ones}.`,
        blanks: [],
        revealAfterPrevious: false,
      },
      {
        id: "s2",
        template: `Split ${minuend} into {0} and {1}`,
        blanks: [
          { index: 0, correctValue: 10 },
          { index: 1, correctValue: ones },
        ],
        revealAfterPrevious: true,
      },
      {
        id: "s3",
        template: `Subtract ${subtrahend} from 10 to get {0}`,
        blanks: [{ index: 0, correctValue: subtractedFromTen }],
        revealAfterPrevious: true,
      },
      {
        id: "s4",
        template: `{0} and {1} make {2}`,
        blanks: [
          { index: 0, correctValue: subtractedFromTen },
          { index: 1, correctValue: ones },
          { index: 2, correctValue: result },
        ],
        revealAfterPrevious: true,
      },
    ],
    finalAnswer: result,
  };
}

// ── Unified wrapper ────────────────────────────────────

export function generateUse10Subtraction(
  minuend: number,
  subtrahend: number,
  method: "A" | "B" | "both" = "B",
): GuidedBoxProblem | GuidedBoxProblem[] {
  if (method === "A") return generateUse10SubtractionMethodA(minuend, subtrahend);
  if (method === "B") return generateUse10SubtractionMethodB(minuend, subtrahend);
  return [
    generateUse10SubtractionMethodA(minuend, subtrahend),
    generateUse10SubtractionMethodB(minuend, subtrahend),
  ];
}

// ── Batch generators ───────────────────────────────────

export function generateAllMake10Problems(): GuidedBoxProblem[] {
  const problems: GuidedBoxProblem[] = [];
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a + b > 10 && a + b <= 18) {
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
        problems.push(generateUse10SubtractionMethodA(minuend, sub));
        problems.push(generateUse10SubtractionMethodB(minuend, sub));
      }
    }
  }
  return problems;
}
