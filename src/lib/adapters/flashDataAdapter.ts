/**
 * Thin translation layer: Flash-extracted JSON -> App types.
 *
 * Each adapter function returns Activity[] so multi-item Flash problems
 * expand to one Activity per sub-item.
 */

import type {
  Activity,
  AreaGridData,
  CapacityData,
  ConceptKey,
  GuidedBoxProblem,
  HundredsChartData,
  MixedWordProblemData,
  PlaceValueData,
  Shape3Dto2DData,
  ShapeIdentifyData,
  TellTimeData,
} from "../../types/curriculum";
import { getHourAngle } from "../generators/clockGenerator";

interface FlashChapter {
  chapter: number;
  title: string;
  verificationPage?: string;
  problems: FlashProblem[];
}

interface FlashProblem {
  id: string;
  sheet?: number;
  page?: number;
  assessment?: string;
  type: string;
  instruction: string;
  items?: unknown[];
  data?: unknown;
  answer?: unknown;
  pairs?: unknown[];
  characters?: unknown[];
}

export interface AdaptedChapter {
  chapterId: string;
  title: string;
  activities: Activity[];
  skipped: { id: string; type: string; reason: string }[];
}

export function adaptFlashChapter(raw: FlashChapter): AdaptedChapter {
  const chapterId = `ch${raw.chapter}`;
  const activities: Activity[] = [];
  const skipped: { id: string; type: string; reason: string }[] = [];

  for (const problem of raw.problems) {
    const results = adaptProblem(problem);
    if (results.length > 0) {
      activities.push(...results);
    } else {
      skipped.push({
        id: problem.id,
        type: problem.type,
        reason: `No adapter for type "${problem.type}"`,
      });
    }
  }

  return { chapterId, title: raw.title, activities, skipped };
}

function adaptProblem(p: FlashProblem): Activity[] {
  switch (p.type) {
    case "multiple-choice-visual":
      return adaptMultipleChoiceVisual(p);
    case "visual-selection":
      return adaptVisualSelection(p);
    case "matching":
      return adaptMatching(p);
    case "counting-composite":
      return adaptCountingComposite(p);
    case "unit-counting":
      return adaptUnitCounting(p);
    case "ordering":
      return adaptOrdering(p);
    case "area-grid-counting":
      return adaptAreaGridCounting(p);
    case "area-comparison-visual":
      return adaptAreaComparisonVisual(p);
    case "split-tree-addition":
      return adaptSplitTreeAddition(p);
    case "split-tree-subtraction":
      return adaptSplitTreeSubtraction(p);
    case "fill-in-the-blanks":
      return adaptFillInBlanks(p);
    case "word-problem":
    case "word_problem":
      return adaptWordProblem(p);
    case "result-finding":
      return adaptResultFinding(p);
    case "ten-grouping":
      return adaptTenGrouping(p);
    case "place-value-counting":
      return adaptPlaceValueCounting(p);
    case "matching-to-100":
      return adaptMatchingTo100(p);
    case "grid-fragment-fill":
      return adaptGridFragmentFill(p);
    case "math-problems":
      return adaptMathProblems(p);
    case "capacity-ordering":
    case "capacity_ordering":
      return adaptCapacityOrdering(p);
    // --- Ch15-17 types (underscore + hyphen variants) ---
    case "mixed_arithmetic":
      return adaptMixedArithmetic(p);
    case "multiple_choice":
      return adaptMultipleChoice(p);
    case "comparison_circle":
    case "number_comparison":
    case "number-comparison":
      return adaptNumberComparison(p);
    case "grid_fragment":
      return adaptGridFragment(p);
    case "area_ordering":
    case "area_ordering_grid":
      return adaptAreaOrdering(p);
    case "make_ten_addition":
      return adaptMakeTenAddition(p);
    case "analog_clock_read":
    case "analog-clock-read":
      return adaptAnalogClockRead(p);
    case "counting_to_100":
      return adaptCountingTo100(p);
    case "place-value-composition":
      return adaptPlaceValueComposition(p);
    case "subtraction-word-problem":
      return adaptSubtractionWordProblem(p);
    case "ordinal-word-problem":
      return adaptOrdinalWordProblem(p);
    case "trace_source_identification":
    case "shape-tracing-match":
      return adaptShapeTracingMatch(p);
    case "odd_one_out_3d":
      return adaptOddOneOut3d(p);
    case "capacity_matching":
      return adaptCapacityMatching(p);
    case "object_part_counting":
      return adaptObjectPartCounting(p);
    case "fill_missing_numbers":
      return adaptFillMissingNumbers(p);
    case "number_ordering":
      return adaptNumberOrdering(p);
    default:
      return [];
  }
}

interface FlashMCVItem {
  target: { imageType: string; imageValue?: string };
  options: { id: string; imageType: string; context: string }[];
  answer: string;
}

function adaptMultipleChoiceVisual(p: FlashProblem): Activity[] {
  const items = p.items as FlashMCVItem[] | undefined;
  if (!items?.length) return [];

  return items.map((item, index) => {
    const correctIndex = item.options.findIndex((option) => option.id === item.answer);
    const correctOption = item.options[correctIndex];

    const data: ShapeIdentifyData = {
      type: "shape-3d-identify",
      targetShape: item.target.imageType,
      options: item.options.map((option) => option.imageType),
      correctIndex,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "quiz",
      conceptKey: "shape-3d-identify",
      difficulty: 1,
      data,
      contextHint: correctOption?.context,
    };
  });
}

interface FlashVisSelItem {
  source: string;
  options: string[];
  answer: string;
}

function adaptVisualSelection(p: FlashProblem): Activity[] {
  const items = p.data as FlashVisSelItem[] | undefined;
  if (!items?.length) return [];

  const results: Activity[] = [];

  items.forEach((item, index) => {
    const shape3d = normalizeShape3d(item.source);
    const footprint = normalize2d(item.answer);
    if (!shape3d || !footprint) return;

    const data: Shape3Dto2DData = {
      type: "shape-3d-to-2d",
      shape3d,
      correctFootprint: footprint,
      distractors: item.options.filter((option) => option !== item.answer),
    };

    results.push({
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive",
      conceptKey: "shape-3d-to-2d",
      difficulty: 1,
      data,
      contextHint: item.source,
    });
  });

  return results;
}

interface FlashMatchData {
  shapes: { id: string; imageType: string; context: string }[];
  names: string[];
}

function adaptMatching(p: FlashProblem): Activity[] {
  const matchData = p.data as FlashMatchData | undefined;
  const pairs = p.pairs as unknown[] | undefined;
  if (!pairs?.length) return [];

  // Ch15 format: pairs are [number, number] arrays (e.g. "Match to make 100")
  if (Array.isArray(pairs[0]) && typeof (pairs[0] as number[])[0] === "number") {
    return (pairs as [number, number][]).map((pair, index) => {
      const data: GuidedBoxProblem = {
        type: "addition",
        equation: `${pair[0]} + ? = 100`,
        steps: [
          {
            id: `${p.id}-${index}-s1`,
            template: `${pair[0]} + {0} = 100`,
            blanks: [{ index: 0, correctValue: pair[1] }],
            revealAfterPrevious: false,
          },
        ],
        finalAnswer: 100,
      };

      return {
        id: index === 0 ? p.id : `${p.id}-${index + 1}`,
        type: "quiz" as const,
        conceptKey: "guided-box-make10" as ConceptKey,
        difficulty: 1 as const,
        data,
      };
    });
  }

  // Ch10-style format: shapes + names matching
  if (!matchData) return [];

  return (pairs as [string, string][]).flatMap((pair, index) => {
    const shape = matchData.shapes.find((entry) => entry.id === pair[0]);
    if (!shape) return [];

    const data: ShapeIdentifyData = {
      type: "shape-3d-identify",
      targetShape: shape.imageType,
      options: matchData.names,
      correctIndex: matchData.names.indexOf(pair[1]),
    };

    return [{
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "quiz",
      conceptKey: "shape-3d-identify",
      difficulty: 1,
      data,
      contextHint: shape.context,
    }];
  });
}

interface FlashCompositeItem {
  composite?: { description?: string };
  counts?: Partial<Record<"cube" | "cuboid" | "cylinder" | "ball" | "sphere" | "prism", number>>;
}

function adaptCountingComposite(p: FlashProblem): Activity[] {
  const items = p.items as FlashCompositeItem[] | undefined;
  if (!items?.length) return [];

  const results: Activity[] = [];

  items.forEach((item, itemIndex) => {
    const counts = item.counts ?? {};
    const description = item.composite?.description ?? "composite object";

    Object.entries(counts).forEach(([shape, rawCount]) => {
      const count = typeof rawCount === "number" ? rawCount : 0;
      if (count <= 0) return;

      const data: PlaceValueData = {
        type: "place-value-group",
        totalItems: count,
        expectedTens: Math.floor(count / 10),
        expectedOnes: count % 10,
        visualType: "blocks",
        mode: "count-only",
      };

      results.push({
        id: `${p.id}-${itemIndex + 1}-${shape}`,
        type: "interactive",
        conceptKey: "place-value-group",
        difficulty: 1,
        data,
        contextHint: `${description} (${shape})`,
      });
    });
  });

  return results;
}

interface FlashUnitCountItem {
  target: { imageType: string; context: string };
  cups: number;
}

function adaptUnitCounting(p: FlashProblem): Activity[] {
  const items = p.items as FlashUnitCountItem[] | undefined;
  if (!items?.length) return [];

  const data: CapacityData = {
    type: "compare-capacity",
    containers: items.map((item) => ({
      id: item.target.context,
      label: item.target.context,
      imageId: item.target.imageType,
      capacityCups: item.cups,
    })),
    mode: "compare-two",
    question: "which-more",
    correctAnswer: Math.max(...items.map((item) => item.cups)),
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "compare-capacity",
    difficulty: 1,
    data,
    contextHint: items.map((item) => item.target.context).join(", "),
  }];
}

interface FlashOrderingItem {
  id: string;
  imageType: string;
  context?: string;
  fill?: string;
}

function adaptOrdering(p: FlashProblem): Activity[] {
  const items = p.items as FlashOrderingItem[] | undefined;
  const answer = p.answer as string[] | undefined;
  if (!items?.length) return [];

  const ranked = items.map((item) => ({
    ...item,
    capacityCups: getRelativeCapacity(item.fill),
  }));

  const correctOrder = answer
    ? [...answer].reverse()
    : [...ranked]
        .sort((a, b) => a.capacityCups - b.capacityCups)
        .map((item) => item.id);

  const data: CapacityData = {
    type: "compare-capacity",
    containers: ranked.map((item) => ({
      id: item.id,
      label: item.id,
      imageId: item.imageType,
      capacityCups: item.capacityCups,
    })),
    mode: "order-multiple",
    question: "order",
    correctAnswer: ranked.map((item) => item.capacityCups),
    correctOrder,
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "compare-capacity",
    difficulty: 1,
    data,
    contextHint: ranked.map((item) => item.context ?? item.imageType).join(", "),
  }];
}

interface FlashAreaGridItem {
  id: string;
  shape: string;
  units: number;
}

function adaptAreaGridCounting(p: FlashProblem): Activity[] {
  const items = p.items as FlashAreaGridItem[] | undefined;
  if (!items || items.length < 2) return [];

  const results: Activity[] = [];

  for (let i = 0; i < items.length - 1; i++) {
    const first = items[i]!;
    const second = items[i + 1]!;

    const data: AreaGridData = {
      type: "compare-area",
      mode: "count-compare",
      gridRows: 0,
      gridCols: 0,
      shapeA: [],
      shapeB: [],
      shapeLabels: ["Shape A", "Shape B"],
      shapeColors: ["blue", "orange"],
      shapeCounts: [
        { label: "Shape A", count: first.units, color: "blue" },
        { label: "Shape B", count: second.units, color: "orange" },
      ],
      question: "which-larger",
      correctAnswer: first.units >= second.units ? "Shape A" : "Shape B",
    };

    results.push({
      id: i === 0 ? p.id : `${p.id}-pair${i + 1}`,
      type: "interactive",
      conceptKey: "compare-area",
      difficulty: 1,
      data,
      contextHint: `${first.shape} vs ${second.shape}`,
    });
  }

  return results;
}

interface FlashAreaVisualItem {
  id: string;
  shape: string;
  color?: string;
  size?: string;
}

function adaptAreaComparisonVisual(p: FlashProblem): Activity[] {
  const items = p.items as FlashAreaVisualItem[] | undefined;
  const answer = p.answer as string[] | undefined;
  if (!items || items.length < 2) return [];

  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = answer
    ? answer
        .map((id) => byId.get(id))
        .filter((item): item is FlashAreaVisualItem => Boolean(item))
    : [...items].sort((a, b) => getRelativeAreaUnits(a.size) - getRelativeAreaUnits(b.size));

  const results: Activity[] = [];

  for (let i = 0; i < ordered.length - 1; i++) {
    const smaller = ordered[i]!;
    const larger = ordered[i + 1]!;

    const data: AreaGridData = {
      type: "compare-area",
      mode: "count-compare",
      gridRows: 0,
      gridCols: 0,
      shapeA: [],
      shapeB: [],
      shapeLabels: [smaller.id, larger.id],
      shapeColors: [normalizeAreaColor(smaller.color), normalizeAreaColor(larger.color)],
      shapeCounts: [
        {
          label: smaller.id,
          count: getRelativeAreaUnits(smaller.size),
          color: normalizeAreaColor(smaller.color),
        },
        {
          label: larger.id,
          count: getRelativeAreaUnits(larger.size),
          color: normalizeAreaColor(larger.color),
        },
      ],
      question: "which-smaller",
      correctAnswer: smaller.id,
    };

    results.push({
      id: i === 0 ? p.id : `${p.id}-pair${i + 1}`,
      type: "interactive",
      conceptKey: "compare-area",
      difficulty: 1,
      data,
      contextHint: `${smaller.shape} vs ${larger.shape}`,
    });
  }

  return results;
}

interface FlashSplitAddData {
  equation: string;
  steps: { description: string; value?: number; parts?: number[]; sum?: number }[];
}

function adaptSplitTreeAddition(p: FlashProblem): Activity[] {
  const raw = p.data as FlashSplitAddData | undefined;
  if (!raw) return [];

  const [aText, bText] = raw.equation.split("+").map((value) => value.trim());
  const a = parseInt(aText ?? "", 10);
  const b = parseInt(bText ?? "", 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return [];

  const other = a >= b ? a : b;
  const target = a >= b ? b : a;
  const give = 10 - other;
  const keep = target - give;
  const sum = a + b;

  const data: GuidedBoxProblem = {
    type: "addition",
    equation: raw.equation,
    steps: [
      {
        id: `${p.id}-s1`,
        template: `${other} needs {0} more to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: false,
      },
      {
        id: `${p.id}-s2`,
        template: `Split ${target} into {0} and {1}`,
        blanks: [
          { index: 0, correctValue: give },
          { index: 1, correctValue: keep },
        ],
        revealAfterPrevious: true,
      },
      {
        id: `${p.id}-s3`,
        template: `Add {0} to ${other} to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: true,
      },
      {
        id: `${p.id}-s4`,
        template: `10 and {0} make {1}`,
        blanks: [
          { index: 0, correctValue: keep },
          { index: 1, correctValue: sum },
        ],
        revealAfterPrevious: true,
      },
    ],
    finalAnswer: sum,
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "addition-make-10",
    difficulty: 1,
    data,
  }];
}

interface FlashSplitSubData {
  equation: string;
  steps: {
    description: string;
    logic?: string;
    parts?: number[];
    calculation?: number[];
  }[];
}

function adaptSplitTreeSubtraction(p: FlashProblem): Activity[] {
  const raw = p.data as FlashSplitSubData | undefined;
  if (!raw) return [];

  const [minuendText, subtrahendText] = raw.equation.split("-").map((value) => value.trim());
  const minuend = parseInt(minuendText ?? "", 10);
  const subtrahend = parseInt(subtrahendText ?? "", 10);
  if (Number.isNaN(minuend) || Number.isNaN(subtrahend)) return [];

  const dropTo10 = minuend - 10;
  const remaining = subtrahend - dropTo10;
  const result = 10 - remaining;

  const data: GuidedBoxProblem = {
    type: "subtraction",
    equation: raw.equation,
    steps: [
      {
        id: `${p.id}-s1`,
        template: `${minuend} needs to go down to 10. Split ${subtrahend} into {0} and {1}.`,
        blanks: [
          { index: 0, correctValue: dropTo10 },
          { index: 1, correctValue: remaining },
        ],
        revealAfterPrevious: false,
      },
      {
        id: `${p.id}-s2`,
        template: `${minuend} - {0} = 10`,
        blanks: [{ index: 0, correctValue: dropTo10 }],
        revealAfterPrevious: true,
      },
      {
        id: `${p.id}-s3`,
        template: `10 - {0} = {1}`,
        blanks: [
          { index: 0, correctValue: remaining },
          { index: 1, correctValue: result },
        ],
        revealAfterPrevious: true,
      },
    ],
    finalAnswer: result,
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "subtraction-use-10",
    difficulty: 1,
    data,
  }];
}

interface FlashFIBItem {
  equation: string;
  answer: number;
}

function adaptFillInBlanks(p: FlashProblem): Activity[] {
  const items = p.items as FlashFIBItem[] | undefined;
  if (!items?.length) return [];

  return items.map((item, index) => {
    const isAdd = item.equation.includes("+");
    const conceptKey: ConceptKey = isAdd ? "guided-box-make10" : "guided-box-sub10";

    const data: GuidedBoxProblem = {
      type: isAdd ? "addition" : "subtraction",
      equation: item.equation.replace("__", "?"),
      steps: [
        {
          id: `${p.id}-${index}-s1`,
          template: item.equation.replace("__", "{0}"),
          blanks: [{ index: 0, correctValue: item.answer }],
          revealAfterPrevious: false,
        },
      ],
      finalAnswer: item.answer,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "quiz",
      conceptKey,
      difficulty: 1,
      data,
    };
  });
}

interface FlashCharacter {
  name: string;
}

interface FlashWordProblemData {
  initial?: number;
  total?: number;
  added?: number;
  removed?: number;
  given?: number;
  item?: string;
  unit?: string;
  youssefUnits?: number;
  omarUnits?: number;
  question?: string;
}

function adaptWordProblem(p: FlashProblem): Activity[] {
  const raw = p.data as FlashWordProblemData | undefined;
  if (!raw) return [];

  const characters = p.characters as FlashCharacter[] | undefined;
  const initial = raw.initial ?? raw.total;

  if (typeof initial === "number" && typeof raw.added === "number") {
    const unit = raw.unit ?? raw.item ?? "items";
    return [createWordProblemActivity({
      id: p.id,
      storyAr: p.instruction,
      storyEn: p.instruction,
      operation: "+",
      operands: [initial, raw.added],
      correctAnswer: typeof p.answer === "number" ? p.answer : initial + raw.added,
      imageId: unit,
      contextHint: unit,
    })];
  }

  const removed = raw.removed ?? raw.given;
  if (typeof initial === "number" && typeof removed === "number") {
    const unit = raw.item ?? raw.unit ?? "items";
    return [createWordProblemActivity({
      id: p.id,
      storyAr: p.instruction,
      storyEn: p.instruction,
      operation: "-",
      operands: [initial, removed],
      correctAnswer: typeof p.answer === "number" ? p.answer : initial - removed,
      imageId: unit,
      contextHint: unit,
    })];
  }

  if (typeof raw.youssefUnits === "number" && typeof raw.omarUnits === "number") {
    const names = characters?.map((character) => character.name) ?? ["Youssef", "Omar"];
    const firstName = names[0] ?? "Youssef";
    const secondName = names[1] ?? "Omar";
    const larger = Math.max(raw.youssefUnits, raw.omarUnits);
    const smaller = Math.min(raw.youssefUnits, raw.omarUnits);
    const largerName = raw.youssefUnits >= raw.omarUnits ? firstName : secondName;
    const smallerName = raw.youssefUnits < raw.omarUnits ? firstName : secondName;

    return [createWordProblemActivity({
      id: p.id,
      storyAr: p.instruction,
      storyEn: `${largerName} colored ${larger} squares. ${smallerName} colored ${smaller} squares. How many more squares did ${largerName} color?`,
      operation: "-",
      operands: [larger, smaller],
      correctAnswer: larger - smaller,
      imageId: "squares",
      contextHint: raw.question ?? "comparison",
    })];
  }

  return [];
}

interface FlashResultEquationItem {
  equation: string;
  answer: number;
}

interface FlashResultVisualRecallItem {
  id: string;
  type: "visual-recall";
  text: string;
  target: string;
  answer: string;
}

function adaptResultFinding(p: FlashProblem): Activity[] {
  const items = p.items as Array<FlashResultEquationItem | FlashResultVisualRecallItem> | undefined;
  if (!items?.length) return [];

  return items.flatMap((item, index) => {
    const id = index === 0 ? p.id : `${p.id}-${index + 1}`;

    if ("equation" in item && typeof item.answer === "number") {
      const activity = createEquationActivity(item.equation, item.answer, id);
      return activity ? [activity] : [];
    }

    if ("type" in item && item.type === "visual-recall") {
      const shape3d = normalizeShape3d(item.answer);
      const footprint = normalize2d(item.target);
      if (!shape3d || !footprint) return [];

      const data: Shape3Dto2DData = {
        type: "shape-3d-to-2d",
        shape3d,
        correctFootprint: footprint,
        distractors: getFootprintDistractors(footprint),
      };

      return [{
        id,
        type: "interactive",
        conceptKey: "shape-3d-to-2d",
        difficulty: 1,
        data,
        contextHint: item.text,
      }];
    }

    return [];
  });
}

interface FlashTenGroupItem {
  stacksOfTen: number;
  total: number;
}

function adaptTenGrouping(p: FlashProblem): Activity[] {
  const items = p.items as FlashTenGroupItem[] | undefined;
  if (!items?.length) return [];

  return items.map((item, index) => {
    const data: PlaceValueData = {
      type: "place-value-group",
      totalItems: item.total,
      expectedTens: item.stacksOfTen,
      expectedOnes: 0,
      visualType: "blocks",
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive",
      conceptKey: "place-value-group",
      difficulty: 1,
      data,
    };
  });
}

interface FlashPVCountItem {
  tens: number;
  ones: number;
  total: number;
}

function adaptPlaceValueCounting(p: FlashProblem): Activity[] {
  const items = p.items as FlashPVCountItem[] | undefined;
  if (!items?.length) return [];

  return items.map((item, index) => {
    const data: PlaceValueData = {
      type: "place-value-group",
      totalItems: item.total,
      expectedTens: item.tens,
      expectedOnes: item.ones,
      visualType: "sticks",
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive",
      conceptKey: "place-value-group",
      difficulty: 1,
      data,
    };
  });
}

// --- Ch14 adapters ---

interface FlashMatchingTo100Pair {
  left: number;
  right: number;
}

function adaptMatchingTo100(p: FlashProblem): Activity[] {
  const pairs = p.pairs as FlashMatchingTo100Pair[] | undefined;
  if (!pairs?.length) return [];

  return pairs.map((pair, index) => {
    const data: GuidedBoxProblem = {
      type: "addition",
      equation: `${pair.left} + ? = 100`,
      steps: [
        {
          id: `${p.id}-${index}-s1`,
          template: `${pair.left} + {0} = 100`,
          blanks: [{ index: 0, correctValue: pair.right }],
          revealAfterPrevious: false,
        },
      ],
      finalAnswer: 100,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "quiz" as const,
      conceptKey: "guided-box-make10" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

interface FlashGridFragment {
  center: number;
  top?: number | null;
  bottom?: number | null;
  left?: number | null;
  right?: number | null;
}

function adaptGridFragmentFill(p: FlashProblem): Activity[] {
  const fragments = (p as unknown as { fragments: FlashGridFragment[] }).fragments;
  if (!Array.isArray(fragments) || !fragments.length) return [];

  return fragments.map((frag, index) => {
    const neighbors = [frag.top, frag.bottom, frag.left, frag.right].filter(
      (v): v is number => typeof v === "number",
    );
    // Hide the center — child must deduce it from neighbors
    const missingCells = [frag.center];

    const data: HundredsChartData = {
      type: "place-value-hundreds-chart",
      mode: "fill-missing",
      missingCells,
      preHighlighted: neighbors,
      correctCell: frag.center,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-hundreds-chart" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

interface FlashMathProblemItem {
  problem: string;
  answer: number;
}

function adaptMathProblems(p: FlashProblem): Activity[] {
  const items = p.items as FlashMathProblemItem[] | undefined;
  if (!items?.length) return [];

  return items.flatMap((item, index) => {
    const activity = createEquationActivity(
      item.problem,
      item.answer,
      index === 0 ? p.id : `${p.id}-${index + 1}`,
    );
    return activity ? [activity] : [];
  });
}

interface FlashCapacityOrderItem {
  label: string;
  level: string;
  order?: number;
  rank?: number;
}

function adaptCapacityOrdering(p: FlashProblem): Activity[] {
  const items = p.items as FlashCapacityOrderItem[] | undefined;
  const imageType = (p as unknown as { imageType?: string }).imageType;
  if (!items?.length) return [];

  const getOrder = (item: FlashCapacityOrderItem) => item.order ?? item.rank ?? 0;
  const sorted = [...items].sort((a, b) => getOrder(a) - getOrder(b));

  const data: CapacityData = {
    type: "compare-capacity",
    containers: items.map((item) => ({
      id: item.label,
      label: item.label,
      imageId: imageType ?? "beaker",
      capacityCups: getRelativeCapacity(item.level),
    })),
    mode: "order-multiple",
    question: "order",
    correctAnswer: items.map((item) => getRelativeCapacity(item.level)),
    correctOrder: sorted.map((item) => item.label),
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "compare-capacity",
    difficulty: 1,
    data,
  }];
}

// --- Ch15-17 adapters ---

function adaptMixedArithmetic(p: FlashProblem): Activity[] {
  const subProblems = (p as unknown as { subProblems?: { sentence: string; answer: number }[] }).subProblems;
  if (!Array.isArray(subProblems) || !subProblems.length) return [];

  return subProblems.flatMap((sub, index) => {
    const equation = sub.sentence.replace("__", "?");
    const activity = createEquationActivity(
      equation,
      sub.answer,
      index === 0 ? p.id : `${p.id}-${index + 1}`,
    );
    return activity ? [activity] : [];
  });
}

function adaptMultipleChoice(p: FlashProblem): Activity[] {
  const questions = (p as unknown as { questions?: { text: string; options: number[]; answer: number }[] }).questions;
  if (!Array.isArray(questions) || !questions.length) return [];

  return questions.flatMap((q, index) => {
    const equation = q.text.replace("__", "?");
    const activity = createEquationActivity(
      equation,
      q.answer,
      index === 0 ? p.id : `${p.id}-${index + 1}`,
    );
    return activity ? [activity] : [];
  });
}

function adaptNumberComparison(p: FlashProblem): Activity[] {
  // comparison_circle format: pairs with {options: [a, b], answer}
  const pairFormat = p.pairs as Array<{ options: number[]; answer: number }> | undefined;
  if (pairFormat?.length && typeof pairFormat[0]?.answer === "number") {
    return pairFormat.map((pair, index) => {
      const data: GuidedBoxProblem = {
        type: "addition",
        equation: `${pair.options[0]} ? ${pair.options[1]}`,
        steps: [
          {
            id: `${p.id}-${index}-s1`,
            template: `Which is greater: ${pair.options[0]} or ${pair.options[1]}? Answer: {0}`,
            blanks: [{ index: 0, correctValue: pair.answer }],
            revealAfterPrevious: false,
          },
        ],
        finalAnswer: pair.answer,
      };

      return {
        id: index === 0 ? p.id : `${p.id}-${index + 1}`,
        type: "quiz" as const,
        conceptKey: "guided-box-make10" as ConceptKey,
        difficulty: 1 as const,
        data,
      };
    });
  }

  // number_comparison / number-comparison: items with {left, right, answer}
  const items = p.items as Array<{ left: unknown; right: unknown; answer: string }> | undefined;
  if (!items?.length) return [];

  return items.map((item, index) => {
    const left = typeof item.left === "number" ? item.left : parseInt(String(item.left), 10) || 0;
    const right = typeof item.right === "number" ? item.right : parseInt(String(item.right), 10) || 0;
    const larger = Math.max(left, right);

    const data: GuidedBoxProblem = {
      type: "addition",
      equation: `${item.left} ? ${item.right}`,
      steps: [
        {
          id: `${p.id}-${index}-s1`,
          template: `Which is greater: ${item.left} or ${item.right}? Answer: {0}`,
          blanks: [{ index: 0, correctValue: larger }],
          revealAfterPrevious: false,
        },
      ],
      finalAnswer: larger,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "quiz" as const,
      conceptKey: "guided-box-make10" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

function adaptGridFragment(p: FlashProblem): Activity[] {
  const fragments = (p as unknown as { fragments?: Array<{ name?: string; base: number; neighbors: Record<string, number>; answer: number[] }> }).fragments;
  if (!Array.isArray(fragments) || !fragments.length) return [];

  return fragments.map((frag, index) => {
    const neighborValues = Object.values(frag.neighbors).filter((v): v is number => typeof v === "number");

    const data: HundredsChartData = {
      type: "place-value-hundreds-chart",
      mode: "fill-missing",
      missingCells: [frag.base],
      preHighlighted: neighborValues,
      correctCell: frag.base,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-hundreds-chart" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

function adaptAreaOrdering(p: FlashProblem): Activity[] {
  const items = p.items as Array<{ id: string; type?: string; units: number; rank: number }> | undefined;
  if (!items || items.length < 2) return [];

  const results: Activity[] = [];
  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  for (let i = 0; i < sorted.length - 1; i++) {
    const first = sorted[i]!;
    const second = sorted[i + 1]!;

    const data: AreaGridData = {
      type: "compare-area",
      mode: "count-compare",
      gridRows: 0,
      gridCols: 0,
      shapeA: [],
      shapeB: [],
      shapeLabels: [first.id, second.id],
      shapeColors: ["blue", "orange"],
      shapeCounts: [
        { label: first.id, count: first.units, color: "blue" },
        { label: second.id, count: second.units, color: "orange" },
      ],
      question: "which-larger",
      correctAnswer: first.units >= second.units ? first.id : second.id,
    };

    results.push({
      id: i === 0 ? p.id : `${p.id}-pair${i + 1}`,
      type: "interactive",
      conceptKey: "compare-area",
      difficulty: 1,
      data,
    });
  }

  return results;
}

function adaptMakeTenAddition(p: FlashProblem): Activity[] {
  const raw = p.data as { start: number; add: number } | undefined;
  const answer = typeof p.answer === "number" ? p.answer : 0;
  if (!raw) return [];

  const { start, add } = raw;
  const give = 10 - start;
  const keep = add - give;

  const data: GuidedBoxProblem = {
    type: "addition",
    equation: `${start} + ${add}`,
    steps: [
      {
        id: `${p.id}-s1`,
        template: `${start} needs {0} more to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: false,
      },
      {
        id: `${p.id}-s2`,
        template: `Split ${add} into {0} and {1}`,
        blanks: [
          { index: 0, correctValue: give },
          { index: 1, correctValue: keep },
        ],
        revealAfterPrevious: true,
      },
      {
        id: `${p.id}-s3`,
        template: `10 + {0} = {1}`,
        blanks: [
          { index: 0, correctValue: keep },
          { index: 1, correctValue: answer || start + add },
        ],
        revealAfterPrevious: true,
      },
    ],
    finalAnswer: answer || start + add,
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "guided-box-make10",
    difficulty: 1,
    data,
  }];
}

function adaptAnalogClockRead(p: FlashProblem): Activity[] {
  const items = p.items as Array<{ id?: string; time: string }> | undefined;
  // Single-item variant (ch17)
  const singleTime = (p as unknown as { time?: string }).time;

  const timeList: string[] = [];
  if (items?.length) {
    timeList.push(...items.map((item) => item.time));
  } else if (singleTime) {
    timeList.push(singleTime);
  }

  if (!timeList.length) return [];

  return timeList.flatMap((time, index) => {
    const data = createClockReadData(time);
    if (!data) return [];
    return [{
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "tell-time" as ConceptKey,
      difficulty: 1 as const,
      data,
    }];
  });
}

function adaptCountingTo100(p: FlashProblem): Activity[] {
  const items = p.items as Array<{ bundles: number; singles: number; answer: number }> | undefined;
  if (!items?.length) return [];

  return items.map((item, index) => {
    const data: PlaceValueData = {
      type: "place-value-group",
      totalItems: item.answer,
      expectedTens: item.bundles,
      expectedOnes: item.singles,
      visualType: "sticks",
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-group" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

function adaptPlaceValueComposition(p: FlashProblem): Activity[] {
  const answer = typeof p.answer === "number" ? p.answer : parseInt(String(p.answer), 10);
  if (Number.isNaN(answer)) return [];

  const data: GuidedBoxProblem = {
    type: "addition",
    equation: p.instruction,
    steps: [
      {
        id: `${p.id}-s1`,
        template: p.instruction.replace(String(answer), "{0}").replace("__", "{0}"),
        blanks: [{ index: 0, correctValue: answer }],
        revealAfterPrevious: false,
      },
    ],
    finalAnswer: answer,
  };

  return [{
    id: p.id,
    type: "quiz",
    conceptKey: "guided-box-make10",
    difficulty: 1,
    data,
  }];
}

function adaptSubtractionWordProblem(p: FlashProblem): Activity[] {
  const answer = typeof p.answer === "number" ? p.answer : parseInt(String(p.answer), 10);
  if (Number.isNaN(answer)) return [];

  const numbers = p.instruction.match(/\d+/g)?.map((v) => parseInt(v, 10)) ?? [];
  const initial = numbers[0] ?? answer + (numbers[1] ?? 0);
  const removed = numbers[1] ?? initial - answer;

  return [createWordProblemActivity({
    id: p.id,
    storyAr: p.instruction,
    storyEn: p.instruction,
    operation: "-",
    operands: [initial, removed],
    correctAnswer: answer,
    imageId: "items",
  })];
}

function adaptOrdinalWordProblem(p: FlashProblem): Activity[] {
  const answer = typeof p.answer === "number" ? p.answer : parseInt(String(p.answer), 10);
  if (Number.isNaN(answer)) return [];

  const data: GuidedBoxProblem = {
    type: "subtraction",
    equation: p.instruction,
    steps: [
      {
        id: `${p.id}-s1`,
        template: `${p.instruction} Answer: {0}`,
        blanks: [{ index: 0, correctValue: answer }],
        revealAfterPrevious: false,
      },
    ],
    finalAnswer: answer,
  };

  return [{
    id: p.id,
    type: "quiz",
    conceptKey: "guided-box-sub10",
    difficulty: 1,
    data,
  }];
}

function adaptShapeTracingMatch(p: FlashProblem): Activity[] {
  // trace_source_identification: single shape → identify 3D source
  const options = (p as unknown as { options?: string[] }).options;
  const answer = typeof p.answer === "string" ? p.answer : String(p.answer ?? "");

  if (options?.length && answer) {
    const shape3d = normalizeShape3d(answer);
    if (!shape3d) return [];

    const data: ShapeIdentifyData = {
      type: "shape-3d-identify",
      targetShape: answer,
      options,
      correctIndex: options.indexOf(answer),
    };

    return [{
      id: p.id,
      type: "quiz",
      conceptKey: "shape-3d-identify",
      difficulty: 1,
      data,
    }];
  }

  // shape-tracing-match: pairs of object → 2D shape
  const pairs = p.pairs as Array<{ object: string; shape: string }> | undefined;
  if (!pairs?.length) return [];

  return pairs.flatMap((pair, index) => {
    const footprint = normalize2d(pair.shape);
    if (!footprint) return [];

    const data: Shape3Dto2DData = {
      type: "shape-3d-to-2d",
      shape3d: "cube", // placeholder — tracing focuses on 2D result
      correctFootprint: footprint,
      distractors: getFootprintDistractors(footprint),
    };

    return [{
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "shape-3d-to-2d" as ConceptKey,
      difficulty: 1 as const,
      data,
      contextHint: pair.object,
    }];
  });
}

function adaptOddOneOut3d(p: FlashProblem): Activity[] {
  const groups = (p as unknown as { groups?: Array<{ items: string[]; answer: string }> }).groups;
  if (!Array.isArray(groups) || !groups.length) return [];

  return groups.map((group, index) => {
    const answerIndex = group.items.indexOf(group.answer);

    const data: ShapeIdentifyData = {
      type: "shape-3d-identify",
      targetShape: group.answer,
      options: group.items,
      correctIndex: answerIndex >= 0 ? answerIndex : 0,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "quiz" as const,
      conceptKey: "shape-3d-identify" as ConceptKey,
      difficulty: 1 as const,
      data,
      contextHint: "Which one does not belong?",
    };
  });
}

function adaptCapacityMatching(p: FlashProblem): Activity[] {
  const pairs = p.pairs as Array<{ item1: string; item2: string; cups: number }> | undefined;
  if (!pairs?.length) return [];

  return pairs.map((pair, index) => {
    const data: CapacityData = {
      type: "compare-capacity",
      containers: [
        { id: "a", label: pair.item1, imageId: "container", capacityCups: pair.cups },
        { id: "b", label: pair.item2, imageId: "container", capacityCups: pair.cups },
      ],
      mode: "compare-two",
      question: "which-more",
      correctAnswer: pair.cups,
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "compare-capacity" as ConceptKey,
      difficulty: 1 as const,
      data,
      contextHint: `${pair.item1} = ${pair.item2} (${pair.cups} cups)`,
    };
  });
}

function adaptObjectPartCounting(p: FlashProblem): Activity[] {
  const questions = (p as unknown as { questions?: Array<{ shape: string; answer: number }> }).questions;
  if (!Array.isArray(questions) || !questions.length) return [];

  return questions.map((q, index) => {
    const data: PlaceValueData = {
      type: "place-value-group",
      totalItems: q.answer,
      expectedTens: Math.floor(q.answer / 10),
      expectedOnes: q.answer % 10,
      visualType: "blocks",
      mode: "count-only",
    };

    return {
      id: index === 0 ? p.id : `${p.id}-${index + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-group" as ConceptKey,
      difficulty: 1 as const,
      data,
      contextHint: `Count ${q.shape} shapes`,
    };
  });
}

function adaptFillMissingNumbers(p: FlashProblem): Activity[] {
  const sequences = (p as unknown as { sequences?: Array<{ data: (number | null)[]; answer: number[] }> }).sequences;
  if (!Array.isArray(sequences) || !sequences.length) return [];

  return sequences.flatMap((seq, seqIndex) => {
    const missingCells = seq.answer;
    if (!missingCells.length) return [];

    const data: HundredsChartData = {
      type: "place-value-hundreds-chart",
      mode: "fill-missing",
      missingCells,
      preHighlighted: seq.data.filter((v): v is number => v !== null),
      correctCell: missingCells[0]!,
    };

    return [{
      id: seqIndex === 0 ? p.id : `${p.id}-${seqIndex + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-hundreds-chart" as ConceptKey,
      difficulty: 1 as const,
      data,
    }];
  });
}

function adaptNumberOrdering(p: FlashProblem): Activity[] {
  const normalized = (p as unknown as { normalized?: number[] }).normalized;
  const answer = p.answer as number[] | undefined;
  if (!normalized?.length || !answer?.length) return [];

  // Present as a sequence of comparison activities
  const sorted = [...normalized].sort((a, b) => a - b);
  const results: Activity[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i]!;
    const right = sorted[i + 1]!;

    const data: GuidedBoxProblem = {
      type: "addition",
      equation: `${left} < ${right}`,
      steps: [
        {
          id: `${p.id}-${i}-s1`,
          template: `What comes after ${left}? Answer: {0}`,
          blanks: [{ index: 0, correctValue: right }],
          revealAfterPrevious: false,
        },
      ],
      finalAnswer: right,
    };

    results.push({
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "quiz",
      conceptKey: "guided-box-make10",
      difficulty: 1,
      data,
    });
  }

  return results;
}

function createClockReadData(time: string): TellTimeData | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = parseInt(match[1] ?? "", 10);
  const minute = parseInt(match[2] ?? "", 10);

  if (minute !== 0 && minute !== 30) return null;

  const minuteLabel: "o-clock" | "half-past" = minute === 0 ? "o-clock" : "half-past";

  return {
    type: "tell-time",
    mode: "read-time",
    hourHandAngle: getHourAngle(hour, minuteLabel),
    minuteHandAngle: minute * 6,
    correctHour: hour,
    correctMinuteLabel: minuteLabel,
    options: [time, `${hour}:00`, `${hour}:30`].filter((v, i, a) => a.indexOf(v) === i),
    correctOption: time,
  };
}

function createWordProblemActivity({
  id,
  storyAr,
  storyEn,
  operation,
  operands,
  correctAnswer,
  imageId,
  contextHint,
}: {
  id: string;
  storyAr: string;
  storyEn: string;
  operation: "+" | "-";
  operands: [number, number];
  correctAnswer: number;
  imageId: string;
  contextHint?: string;
}): Activity {
  const data: MixedWordProblemData = {
    type: "add-sub-mixed",
    storyAr,
    storyEn,
    operation,
    operands,
    correctAnswer,
    imageId,
  };

  return {
    id,
    type: "interactive",
    conceptKey: "add-sub-mixed",
    difficulty: 1,
    data,
    contextHint,
  };
}

function createEquationActivity(equation: string, answer: number, id: string): Activity | null {
  const isAdd = equation.includes("+");
  const conceptKey: ConceptKey = isAdd ? "guided-box-make10" : "guided-box-sub10";

  const data: GuidedBoxProblem = {
    type: isAdd ? "addition" : "subtraction",
    equation,
    steps: [
      {
        id: `${id}-s1`,
        template: `${equation} = {0}`,
        blanks: [{ index: 0, correctValue: answer }],
        revealAfterPrevious: false,
      },
    ],
    finalAnswer: answer,
  };

  return {
    id,
    type: "quiz",
    conceptKey,
    difficulty: 1,
    data,
  };
}

function normalizeShape3d(
  value: string,
): "cube" | "cylinder" | "sphere" | "prism" | "cuboid" | null {
  const map: Record<string, "cube" | "cylinder" | "sphere" | "prism" | "cuboid"> = {
    cube: "cube",
    cylinder: "cylinder",
    sphere: "sphere",
    ball: "sphere",
    prism: "prism",
    cuboid: "cuboid",
  };
  return map[value.toLowerCase()] ?? null;
}

function normalize2d(value: string): "square" | "circle" | "triangle" | "rectangle" | null {
  const map: Record<string, "square" | "circle" | "triangle" | "rectangle"> = {
    square: "square",
    circle: "circle",
    triangle: "triangle",
    rectangle: "rectangle",
  };
  return map[value.toLowerCase()] ?? null;
}

function getRelativeCapacity(fill: string | undefined): number {
  const map: Record<string, number> = {
    empty: 0,
    low: 1,
    quarter: 1,
    medium: 2,
    half: 2,
    "three-quarters": 3,
    high: 3,
    full: 4,
  };
  return fill ? (map[fill.toLowerCase()] ?? 1) : 1;
}

function getRelativeAreaUnits(size: string | undefined): number {
  const map: Record<string, number> = {
    "extra-small": 2,
    small: 4,
    medium: 6,
    large: 8,
    "extra-large": 10,
  };
  return size ? (map[size.toLowerCase()] ?? 4) : 4;
}

function normalizeAreaColor(color: string | undefined): "blue" | "orange" {
  return color?.toLowerCase() === "orange" ? "orange" : "blue";
}

function getFootprintDistractors(
  correct: "square" | "circle" | "triangle" | "rectangle",
): string[] {
  return ["square", "circle", "triangle", "rectangle"].filter((shape) => shape !== correct);
}

export function adaptAllFlashChapters(chapters: FlashChapter[]): AdaptedChapter[] {
  return chapters.map(adaptFlashChapter);
}
