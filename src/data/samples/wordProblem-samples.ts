import type { MixedWordProblemData } from "../../types/curriculum";
import { generateWordProblem } from "../../lib/generators/wordProblemGenerator";

export const SAMPLE_WORD_PROBLEM_ADD: MixedWordProblemData = {
  type: "add-sub-mixed",
  storyAr: "Sara has 7 books. Sara got 3 more. How many books does Sara have now?",
  storyEn: "Sara has 7 books. Sara got 3 more. How many books does Sara have now?",
  operation: "+",
  operands: [7, 3],
  correctAnswer: 10,
  imageId: "books",
};

export const SAMPLE_WORD_PROBLEM_SUB: MixedWordProblemData = {
  type: "add-sub-mixed",
  storyAr: "Hani has 12 apples. Hani gave 5 to a friend. How many apples does Hani have now?",
  storyEn: "Hani has 12 apples. Hani gave 5 to a friend. How many apples does Hani have now?",
  operation: "-",
  operands: [12, 5],
  correctAnswer: 7,
  imageId: "apples",
};

export const RANDOM_WORD_PROBLEM = generateWordProblem(2);
