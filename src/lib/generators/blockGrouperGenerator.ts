import type { PlaceValueData } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickVisualType(): PlaceValueData["visualType"] {
  const visuals: PlaceValueData["visualType"][] = ["stars", "blocks", "sticks"];
  return visuals[randomInt(0, visuals.length - 1)]!;
}

export function generateBlockGrouper(
  difficulty: 1 | 2 | 3,
): PlaceValueData {
  const ranges = {
    1: [10, 30],
    2: [20, 50],
    3: [50, 99],
  } as const;
  const [min, max] = ranges[difficulty];
  let total = randomInt(min, max);

  if (difficulty === 1) {
    total = Math.round(total / 10) * 10;
  }

  return {
    type: "place-value-group",
    totalItems: total,
    expectedTens: Math.floor(total / 10),
    expectedOnes: total % 10,
    visualType: pickVisualType(),
    mode: difficulty === 1 ? "count-only" : "group-then-count",
  };
}
