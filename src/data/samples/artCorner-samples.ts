import type { ArtCornerData } from "../../types/curriculum";
import { generateArtCorner } from "../../lib/generators/artCornerGenerator";

export const SAMPLE_ART_CORNER: ArtCornerData = {
  type: "art-corner",
  instruction: "Color teen sums orange and non-teen sums blue.",
  colorCode: [
    { rule: "Teen number", color: "orange" },
    { rule: "Not a teen number", color: "blue" },
  ],
  regions: [
    { id: "r1", equation: "10+3", correctResult: 13, correctColor: "orange" },
    { id: "r2", equation: "6+6", correctResult: 12, correctColor: "orange" },
    { id: "r3", equation: "9+2", correctResult: 11, correctColor: "orange" },
    { id: "r4", equation: "5+3", correctResult: 8, correctColor: "blue" },
    { id: "r5", equation: "7+5", correctResult: 12, correctColor: "orange" },
    { id: "r6", equation: "4+4", correctResult: 8, correctColor: "blue" },
    { id: "r7", equation: "8+1", correctResult: 9, correctColor: "blue" },
    { id: "r8", equation: "9+5", correctResult: 14, correctColor: "orange" },
    { id: "r9", equation: "3+4", correctResult: 7, correctColor: "blue" },
  ],
};

export const RANDOM_ART_CORNER_9 = generateArtCorner(9);
export const RANDOM_ART_CORNER_12 = generateArtCorner(12);
