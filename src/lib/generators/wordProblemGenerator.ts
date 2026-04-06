import type { MixedWordProblemData } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

export function generateWordProblem(
  difficulty: 1 | 2 | 3,
): MixedWordProblemData {
  const operation = pickRandom<"+" | "-">(["+", "-"]);
  const item = pickRandom(["apples", "books", "birds", "pencils", "stars"]);
  const name = pickRandom(["Hani", "Sara", "Omar", "Nour"]);

  let a: number;
  let b: number;

  if (operation === "+") {
    a = randomInt(3, 9 * difficulty);
    b = randomInt(1, a);
  } else {
    a = randomInt(5, 10 * difficulty);
    b = randomInt(1, a - 1);
  }

  const correctAnswer = operation === "+" ? a + b : a - b;
  const storyEn =
    operation === "+"
      ? `${name} has ${a} ${item}. ${name} got ${b} more. How many ${item} does ${name} have now?`
      : `${name} has ${a} ${item}. ${name} gave ${b} to a friend. How many ${item} does ${name} have now?`;

  return {
    type: "add-sub-mixed",
    storyAr: storyEn,
    storyEn,
    operation,
    operands: [a, b],
    correctAnswer,
    imageId: item,
  };
}
