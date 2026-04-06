import type { ComposeShapesData, ShapePiece } from "../../types/curriculum";

const COMPOSITIONS: Array<{
  targetShape: string;
  targetDescription: string;
  correctPieces: ShapePiece["shape"][];
  wrongOptions: ShapePiece["shape"][][];
}> = [
  {
    targetShape: "rectangle",
    targetDescription: "a rectangle",
    correctPieces: ["triangle", "triangle"],
    wrongOptions: [["square"], ["triangle", "square"]],
  },
  {
    targetShape: "square",
    targetDescription: "a square",
    correctPieces: ["triangle", "triangle"],
    wrongOptions: [["rectangle"], ["square", "triangle"]],
  },
  {
    targetShape: "rectangle",
    targetDescription: "a rectangle",
    correctPieces: ["square", "square"],
    wrongOptions: [["triangle", "triangle"], ["rectangle"]],
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function generateShapeComposer(): ComposeShapesData {
  const composition = COMPOSITIONS[randomInt(0, COMPOSITIONS.length - 1)]!;
  const options = shuffle([
    {
      id: "correct",
      pieces: composition.correctPieces,
      label: composition.correctPieces.join(" + "),
    },
    ...composition.wrongOptions.map((pieces, index) => ({
      id: `wrong-${index + 1}`,
      pieces,
      label: pieces.join(" + "),
    })),
  ]);

  return {
    type: "compose-shapes",
    mode: "select-pieces",
    targetShape: composition.targetShape,
    targetDescription: composition.targetDescription,
    availablePieces: composition.correctPieces.map((shape, index) => ({
      id: `piece-${index}`,
      shape,
      rotation: 0,
    })),
    correctCombination: composition.correctPieces,
    options,
    correctOptionId: "correct",
  };
}
