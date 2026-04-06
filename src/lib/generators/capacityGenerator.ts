import type { CapacityData } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

function ensureUniqueCaps(values: number[]): number[] {
  const used = new Set<number>();
  return values.map((value) => {
    let current = value;
    while (used.has(current)) current += 1;
    used.add(current);
    return current;
  });
}

export function generateCapacity(
  mode: NonNullable<CapacityData["mode"]>,
  difficulty: 1 | 2 | 3,
): CapacityData {
  const maxCups = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const containerCount =
    mode === "compare-two" || mode === "difference"
      ? 2
      : mode === "order-multiple"
        ? randomInt(3, 4)
        : randomInt(2, 3);

  const rawCaps = Array.from({ length: containerCount }, () => randomInt(1, maxCups));
  const caps = ensureUniqueCaps(rawCaps);

  const containers = caps.map((capacityCups, index) => ({
    id: `c${index}`,
    label: `Container ${String.fromCharCode(65 + index)}`,
    imageId: pickRandom(["jug", "bottle", "box"]),
    capacityCups,
  }));

  const sorted = [...containers].sort((a, b) => a.capacityCups - b.capacityCups);

  return {
    type: "compare-capacity",
    mode,
    containers,
    question:
      mode === "compare-two"
        ? pickRandom<CapacityData["question"]>(["which-more", "which-less"])
        : mode === "difference"
          ? "difference"
          : "order",
    correctAnswer:
      mode === "difference"
        ? Math.abs(containers[0]!.capacityCups - containers[1]!.capacityCups)
        : mode === "compare-two"
          ? Math.max(...containers.map((container) => container.capacityCups))
          : sorted.map((container) => container.capacityCups),
    correctOrder:
      mode === "order-multiple" ? sorted.map((container) => container.id!) : undefined,
  };
}
