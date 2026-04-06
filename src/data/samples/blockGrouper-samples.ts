import type { PlaceValueData } from "../../types/curriculum";
import { generateBlockGrouper } from "../../lib/generators/blockGrouperGenerator";

export const SAMPLE_BLOCK_GROUPER_1: PlaceValueData = {
  type: "place-value-group",
  totalItems: 20,
  expectedTens: 2,
  expectedOnes: 0,
  visualType: "stars",
  mode: "count-only",
};

export const SAMPLE_BLOCK_GROUPER_2: PlaceValueData = {
  type: "place-value-group",
  totalItems: 24,
  expectedTens: 2,
  expectedOnes: 4,
  visualType: "blocks",
  mode: "group-then-count",
};

export const SAMPLE_BLOCK_GROUPER_3: PlaceValueData = {
  type: "place-value-group",
  totalItems: 57,
  expectedTens: 5,
  expectedOnes: 7,
  visualType: "sticks",
  mode: "group-then-count",
};

export const RANDOM_BLOCK_GROUPERS: PlaceValueData[] = [
  generateBlockGrouper(1),
  generateBlockGrouper(2),
  generateBlockGrouper(3),
];
