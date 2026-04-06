import type { CapacityData } from "../../types/curriculum";
import { generateCapacity } from "../../lib/generators/capacityGenerator";

export const SAMPLE_CAPACITY_COUNT: CapacityData = {
  type: "compare-capacity",
  mode: "count-cups",
  question: "order",
  correctAnswer: [2, 5, 3],
  containers: [
    { id: "a", label: "Container A", imageId: "jug", capacityCups: 2 },
    { id: "b", label: "Container B", imageId: "bottle", capacityCups: 5 },
    { id: "c", label: "Container C", imageId: "box", capacityCups: 3 },
  ],
};

export const SAMPLE_CAPACITY_COMPARE: CapacityData = {
  type: "compare-capacity",
  mode: "compare-two",
  question: "which-more",
  correctAnswer: 6,
  containers: [
    { id: "a", label: "Red jug", imageId: "jug", capacityCups: 6 },
    { id: "b", label: "Blue bottle", imageId: "bottle", capacityCups: 4 },
  ],
};

export const SAMPLE_CAPACITY_ORDER: CapacityData = {
  type: "compare-capacity",
  mode: "order-multiple",
  question: "order",
  correctAnswer: [2, 4, 7],
  correctOrder: ["a", "b", "c"],
  containers: [
    { id: "a", label: "Container A", imageId: "box", capacityCups: 2 },
    { id: "b", label: "Container B", imageId: "jug", capacityCups: 4 },
    { id: "c", label: "Container C", imageId: "bottle", capacityCups: 7 },
  ],
};

export const SAMPLE_CAPACITY_DIFFERENCE: CapacityData = {
  type: "compare-capacity",
  mode: "difference",
  question: "difference",
  correctAnswer: 3,
  containers: [
    { id: "a", label: "Container A", imageId: "jug", capacityCups: 8 },
    { id: "b", label: "Container B", imageId: "box", capacityCups: 5 },
  ],
};

export const RANDOM_CAPACITY_SAMPLES: CapacityData[] = [
  generateCapacity("count-cups", 1),
  generateCapacity("compare-two", 1),
  generateCapacity("order-multiple", 2),
  generateCapacity("difference", 2),
];
