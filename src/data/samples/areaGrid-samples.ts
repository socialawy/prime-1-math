import type { AreaGridData } from "../../types/curriculum";
import { generateAreaGrid } from "../../lib/generators/areaGridGenerator";

export const SAMPLE_AREA_GRID_VISUAL: AreaGridData = {
  type: "compare-area",
  mode: "grid-visual",
  gridRows: 4,
  gridCols: 6,
  shapeA: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 0 },
  ],
  shapeB: [
    { row: 0, col: 4 },
    { row: 0, col: 5 },
    { row: 1, col: 4 },
    { row: 1, col: 5 },
    { row: 2, col: 4 },
    { row: 2, col: 5 },
    { row: 3, col: 4 },
  ],
  shapeLabels: ["Blue", "Orange"],
  shapeColors: ["blue", "orange"],
  question: "which-larger",
  correctAnswer: "Orange",
};

export const SAMPLE_AREA_GRID_DIFFERENCE: AreaGridData = {
  type: "compare-area",
  mode: "grid-visual",
  gridRows: 5,
  gridCols: 5,
  shapeA: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ],
  shapeB: [
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 2, col: 3 },
    { row: 2, col: 4 },
    { row: 3, col: 3 },
  ],
  shapeLabels: ["Blue", "Orange"],
  shapeColors: ["blue", "orange"],
  question: "how-many-more",
  correctAnswer: 2,
};

export const SAMPLE_AREA_GRID_COUNT_COMPARE: AreaGridData = {
  type: "compare-area",
  mode: "count-compare",
  gridRows: 0,
  gridCols: 0,
  shapeA: [],
  shapeB: [],
  shapeLabels: ["Shape A", "Shape B"],
  shapeColors: ["blue", "orange"],
  shapeCounts: [
    { label: "Shape A", count: 8, color: "blue" },
    { label: "Shape B", count: 5, color: "orange" },
  ],
  question: "which-larger",
  correctAnswer: "Shape A",
};

export const RANDOM_AREA_GRIDS: AreaGridData[] = [
  generateAreaGrid(1),
  generateAreaGrid(2),
  generateAreaGrid(3),
];
