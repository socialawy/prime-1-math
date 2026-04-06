// Exact vocabulary extracted from El-Moasser Primary 1 Math (Term 2) textbook.
// The book strictly appends "shape" after 3D terms, e.g. "Cube shape" not "Cube".

export const SHAPES_3D = [
  "Ball shape",
  "Cylinder shape",
  "Cube shape",
  "Prism shape",
  "Cuboid shape",
] as const;

export const SHAPES_2D = [
  "square",
  "circle",
  "triangle",
  "rectangle",
] as const;

// The book uses "spliting" (one 't') in the original text.
// We keep both the original and corrected forms.
export const MAKE_10_INSTRUCTIONS = {
  heading: "Make a 10 to add",
  firstWay: {
    label: "First Way: By spliting the smaller number",
    steps: [
      "{a} needs {toMake10} more to make 10 so, split {b} into {toMake10} and {remainder}",
      "Add {toMake10} to {a} to make 10",
      "10 and {remainder} make {sum}",
    ],
  },
  secondWay: {
    label: "Second Way: By spliting the greater number",
    steps: [
      "{b} needs {toMake10} more to make 10 so, split {a} into {remainder} and {toMake10}",
      "Add {toMake10} to {b} to make 10",
      "{remainder} and 10 make {sum}",
    ],
  },
  notice:
    "You can split either number to make it easier for you to calculate.",
} as const;

// Instruction verbs used in the textbook
export const INSTRUCTION_VERBS = [
  "Circle",
  "Color",
  "Draw",
  "Cross out",
  "Match",
  "Join",
  "Arrange",
  "Count",
  "Write",
  "Complete",
  "Choose",
] as const;

// The book uses "Units" for measurement and "Ones" for place value — never interchangeably.
export const TERMINOLOGY = {
  units: "Units",       // capacity & area measurement context
  ones: "Ones",         // place value context
  tens: "Tens",
  hundreds: "Hundreds",
  ball: "Ball",         // never "Sphere"
} as const;

export const CHAPTER_TITLES = {
  ch10: { en: "Different Shapes", ar: "أشكال مختلفة" },
  ch11: { en: "How to Compare?", ar: "كيف نقارن؟" },
  ch12: { en: "Addition by making 10", ar: "الجمع بتكوين ١٠" },
  ch13: { en: "Subtraction by using 10", ar: "الطرح باستخدام ١٠" },
  ch14: { en: "Ones, Tens, and Hundreds", ar: "الآحاد والعشرات والمئات" },
  ch15: { en: "Making Shapes", ar: "تكوين الأشكال" },
  ch16: { en: "What Time is it?", ar: "كم الساعة؟" },
  ch17: { en: "Addition and Subtraction", ar: "الجمع والطرح" },
} as const;
