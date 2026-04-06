import type { AreaGridData, GridCell } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

export function generateAreaGrid(difficulty: 1 | 2 | 3): AreaGridData {
  const gridSize = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
  const sizeA = randomInt(3, 5 + difficulty);
  let sizeB = randomInt(3, 5 + difficulty);
  if (sizeA === sizeB) sizeB += 1;

  const shapeA = generateConnectedShape(gridSize, sizeA);
  const shapeB = generateConnectedShape(gridSize, sizeB, shapeA);
  const countA = shapeA.length;
  const countB = shapeB.length;
  const question = pickRandom<AreaGridData["question"]>([
    "which-larger",
    "how-many-more",
  ]);

  return {
    type: "compare-area",
    mode: "grid-visual",
    gridRows: gridSize,
    gridCols: gridSize,
    shapeA,
    shapeB,
    shapeLabels: ["Blue", "Orange"],
    shapeColors: ["blue", "orange"],
    question,
    correctAnswer:
      question === "how-many-more"
        ? Math.abs(countA - countB)
        : countA > countB
          ? "Blue"
          : "Orange",
  };
}

function generateConnectedShape(
  gridSize: number,
  targetSize: number,
  avoid: GridCell[] = [],
): GridCell[] {
  const cells: GridCell[] = [];
  const used = new Set(avoid.map((cell) => `${cell.row},${cell.col}`));

  let start: GridCell;
  do {
    start = {
      row: randomInt(0, gridSize - 1),
      col: randomInt(0, gridSize - 1),
    };
  } while (used.has(`${start.row},${start.col}`));

  cells.push(start);
  used.add(`${start.row},${start.col}`);

  while (cells.length < targetSize) {
    const anchor = pickRandom(cells);
    const direction = pickRandom([
      { row: 0, col: 1 },
      { row: 0, col: -1 },
      { row: 1, col: 0 },
      { row: -1, col: 0 },
    ]);
    const next = {
      row: anchor.row + direction.row,
      col: anchor.col + direction.col,
    };
    const key = `${next.row},${next.col}`;

    if (
      next.row >= 0 &&
      next.row < gridSize &&
      next.col >= 0 &&
      next.col < gridSize &&
      !used.has(key)
    ) {
      cells.push(next);
      used.add(key);
    }
  }

  return cells;
}
