import type { ShapeIdentifyData, Shape3Dto2DData } from "../../types/curriculum";
import type { Shape2DKind } from "../../components/shared/Shape2DSVG";
import type { Shape3DKind } from "../../components/shared/Shape3DSVG";

const SHAPE_3D_OPTIONS: Shape3DKind[] = ["cube", "cuboid", "cylinder", "ball", "prism"];
const SHAPE_2D_OPTIONS: Shape2DKind[] = ["square", "circle", "triangle", "rectangle"];

export const FOOTPRINT_MAP: Record<Shape3DKind, Shape2DKind[]> = {
  cube: ["square"],
  cuboid: ["rectangle", "square"],
  cylinder: ["circle"],
  ball: ["circle"],
  prism: ["triangle", "rectangle"],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function generateShapeIdentify(
  mode: "find-correct" | "odd-one-out" = "find-correct",
): ShapeIdentifyData {
  if (mode === "find-correct") {
    const target = pickRandom(SHAPE_3D_OPTIONS);
    const distractors = shuffle(
      SHAPE_3D_OPTIONS.filter((shape) => shape !== target),
    ).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    return {
      type: "shape-3d-identify",
      targetShape: target,
      options,
      correctIndex: options.indexOf(target),
    };
  }

  const common = pickRandom(SHAPE_3D_OPTIONS);
  const odd = pickRandom(SHAPE_3D_OPTIONS.filter((shape) => shape !== common));
  const options = shuffle([common, common, common, odd]);
  return {
    type: "shape-3d-identify",
    targetShape: common,
    options,
    correctIndex: options.indexOf(odd),
  };
}

export function generateShapeFootprint(): Shape3Dto2DData {
  const shape3d = pickRandom(SHAPE_3D_OPTIONS.filter((shape) => shape !== "ball")) as Exclude<
    Shape3DKind,
    "ball"
  >;
  const validFootprints = FOOTPRINT_MAP[shape3d];
  const correctFootprint = pickRandom(validFootprints);
  // Exclude ALL valid footprints from distractors (cuboid has both rectangle & square,
  // prism has both triangle & rectangle — showing another valid answer as "wrong" is a bug)
  const distractors = shuffle(
    SHAPE_2D_OPTIONS.filter((shape) => !validFootprints.includes(shape)),
  ).slice(0, 3);

  return {
    type: "shape-3d-to-2d",
    shape3d: normalizeCurriculumShape(shape3d),
    correctFootprint,
    distractors,
  };
}

function normalizeCurriculumShape(shape: Shape3DKind): "cube" | "cylinder" | "sphere" | "prism" | "cuboid" {
  if (shape === "ball") return "sphere";
  return shape;
}
