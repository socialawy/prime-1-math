import type { ShapeIdentifyData, Shape3Dto2DData } from "../../types/curriculum";
import { generateShapeFootprint, generateShapeIdentify } from "../../lib/generators/shapeGenerator";

export const SAMPLE_SHAPE_IDENTIFIER_FIND: ShapeIdentifyData = {
  type: "shape-3d-identify",
  targetShape: "cube",
  options: ["sphere", "cube", "cylinder", "prism"],
  correctIndex: 1,
};

export const SAMPLE_SHAPE_IDENTIFIER_ODD: ShapeIdentifyData = {
  type: "shape-3d-identify",
  targetShape: "cube",
  options: ["cube", "cube", "cuboid", "cube"],
  correctIndex: 2,
};

export const SAMPLE_SHAPE_FOOTPRINT: Shape3Dto2DData = {
  type: "shape-3d-to-2d",
  shape3d: "cube",
  correctFootprint: "square",
  distractors: ["circle", "triangle", "rectangle"],
};

export const RANDOM_SHAPE_IDENTIFIER_FIND: ShapeIdentifyData = generateShapeIdentify("find-correct");
export const RANDOM_SHAPE_IDENTIFIER_ODD: ShapeIdentifyData = generateShapeIdentify("odd-one-out");
export const RANDOM_SHAPE_FOOTPRINT: Shape3Dto2DData = generateShapeFootprint();
