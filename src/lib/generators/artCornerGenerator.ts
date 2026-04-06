import type { ArtCornerData } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEquation(): { equation: string; result: number } {
  const a = randomInt(3, 10);
  const b = randomInt(2, 9);
  const result = a + b;
  return {
    equation: `${a}+${b}`,
    result,
  };
}

export function generateArtCorner(
  size: 9 | 12 | 16 = 9,
): ArtCornerData {
  const regions = Array.from({ length: size }, (_, index) => {
    const { equation, result } = generateEquation();
    return {
      id: `r${index + 1}`,
      equation,
      correctResult: result,
      correctColor: result >= 11 && result <= 19 ? "orange" : "blue",
    };
  });

  return {
    type: "art-corner",
    regions,
    colorCode: [
      { rule: "Teen number", color: "orange" },
      { rule: "Not a teen number", color: "blue" },
    ],
    instruction: "Color teen sums orange and non-teen sums blue.",
  };
}
