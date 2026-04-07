import type { ComposeShapesData, ShapePiece } from "../../types/curriculum";

const COMPOSITIONS: Array<{
  targetShape: string;
  targetDescription: string;
  correctPieces: ShapePiece["shape"][];
  wrongOptions: ShapePiece["shape"][][];
}> = [
  // Rectangle = 2 right triangles
  {
    targetShape: "rectangle",
    targetDescription: "a rectangle",
    correctPieces: ["triangle", "triangle"],
    wrongOptions: [["square", "square"], ["triangle", "square"]],
  },
  // Rectangle = 2 squares
  {
    targetShape: "rectangle",
    targetDescription: "a rectangle",
    correctPieces: ["square", "square"],
    wrongOptions: [["triangle", "triangle"], ["triangle", "square"]],
  },
  // Square = 2 triangles
  {
    targetShape: "square",
    targetDescription: "a square",
    correctPieces: ["triangle", "triangle"],
    wrongOptions: [["square", "rectangle"], ["triangle", "rectangle"]],
  },
  // Large triangle = 2 small triangles
  {
    targetShape: "triangle",
    targetDescription: "a large triangle",
    correctPieces: ["triangle", "triangle"],
    wrongOptions: [["square", "triangle"], ["rectangle", "triangle"]],
  },
  // Hexagon = 6 triangles
  {
    targetShape: "hexagon",
    targetDescription: "a hexagon",
    correctPieces: ["triangle", "triangle", "triangle", "triangle", "triangle", "triangle"],
    wrongOptions: [["square", "square", "square"], ["triangle", "triangle", "square", "square"]],
  },
  // Trapezoid = 3 triangles
  {
    targetShape: "trapezoid",
    targetDescription: "a trapezoid",
    correctPieces: ["triangle", "triangle", "triangle"],
    wrongOptions: [["square", "triangle"], ["triangle", "triangle", "square"]],
  },
  // House = square + triangle
  {
    targetShape: "house",
    targetDescription: "a house shape",
    correctPieces: ["square", "triangle"],
    wrongOptions: [["triangle", "triangle"], ["rectangle", "triangle"]],
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

  // Filter wrong options: never include a single piece that IS the target shape
  const filteredWrong = composition.wrongOptions.filter(
    (pieces) => !(pieces.length === 1 && pieces[0] === composition.targetShape),
  );

  const options = shuffle([
    {
      id: "correct",
      pieces: composition.correctPieces,
      label: composition.correctPieces.join(" + "),
    },
    ...filteredWrong.map((pieces, index) => ({
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
