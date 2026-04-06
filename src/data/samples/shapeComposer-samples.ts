import type { ComposeShapesData } from "../../types/curriculum";
import { generateShapeComposer } from "../../lib/generators/shapeComposerGenerator";

export const SAMPLE_SHAPE_COMPOSER: ComposeShapesData = {
  type: "compose-shapes",
  mode: "select-pieces",
  targetShape: "rectangle",
  targetDescription: "a rectangle",
  availablePieces: [
    { id: "p1", shape: "triangle", rotation: 0 },
    { id: "p2", shape: "triangle", rotation: 180 },
  ],
  correctCombination: ["triangle", "triangle"],
  options: [
    { id: "correct", pieces: ["triangle", "triangle"], label: "Two triangles" },
    { id: "wrong-1", pieces: ["square"], label: "One square" },
    { id: "wrong-2", pieces: ["triangle", "square"], label: "Triangle and square" },
  ],
  correctOptionId: "correct",
};

export const RANDOM_SHAPE_COMPOSER = generateShapeComposer();
