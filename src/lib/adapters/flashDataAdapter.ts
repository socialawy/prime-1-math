/**
 * Thin translation layer: Flash-extracted JSON → App types.
 *
 * Each adapter function returns Activity[] so multi-item Flash problems
 * expand to one Activity per sub-item (3-5x more content from the same data).
 *
 * contextHint is populated wherever the Flash data has a `context` field
 * (real-world object name like "cheese-wedge", "tennis-ball"). Components
 * can use it for flavor text or icon selection.
 *
 * Unmappable types are catalogued in docs/FLASH_DATA_GAPS.md.
 */

import type {
  ShapeIdentifyData,
  Shape3Dto2DData,
  CapacityData,
  AreaGridData,
  PlaceValueData,
  GuidedBoxProblem,
  Activity,
  ConceptKey,
} from "../../types/curriculum";

// ── Flash JSON shapes ──────────────────────────────────

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

// ── Adapter result ─────────────────────────────────────

export interface AdaptedChapter {
  chapterId: string;
  title: string;
  activities: Activity[];
  skipped: { id: string; type: string; reason: string }[];
}

// ── Main entry point ───────────────────────────────────

export function adaptFlashChapter(raw: FlashChapter): AdaptedChapter {
  const chapterId = `ch${raw.chapter}`;
  const activities: Activity[] = [];
  const skipped: { id: string; type: string; reason: string }[] = [];

  for (const p of raw.problems) {
    const results = adaptProblem(p);
    if (results.length > 0) {
      activities.push(...results);
    } else {
      skipped.push({
        id: p.id,
        type: p.type,
        reason: `No adapter for type "${p.type}"`,
      });
    }
  }

  return { chapterId, title: raw.title, activities, skipped };
}

// ── Per-type dispatch ──────────────────────────────────

function adaptProblem(p: FlashProblem): Activity[] {
  switch (p.type) {
    case "multiple-choice-visual":   return adaptMultipleChoiceVisual(p);
    case "visual-selection":         return adaptVisualSelection(p);
    case "matching":                 return adaptMatching(p);
    case "unit-counting":            return adaptUnitCounting(p);
    case "area-grid-counting":       return adaptAreaGridCounting(p);
    case "split-tree-addition":      return adaptSplitTreeAddition(p);
    case "split-tree-subtraction":   return adaptSplitTreeSubtraction(p);
    case "fill-in-the-blanks":       return adaptFillInBlanks(p);
    case "ten-grouping":             return adaptTenGrouping(p);
    case "place-value-counting":     return adaptPlaceValueCounting(p);
    default:                         return [];
  }
}

// ── Ch10: 3D shape identification ──────────────────────
// Each item in the Flash array → one Activity.
// contextHint = the winning option's real-world object (e.g. "cheese-wedge").

interface FlashMCVItem {
  target: { imageType: string; imageValue?: string };
  options: { id: string; imageType: string; context: string }[];
  answer: string;
}

function adaptMultipleChoiceVisual(p: FlashProblem): Activity[] {
  const items = p.items as FlashMCVItem[] | undefined;
  if (!items || items.length === 0) return [];

  return items.map((item, i) => {
    const correctIdx = item.options.findIndex((o) => o.id === item.answer);
    const correctOption = item.options[correctIdx];

    const data: ShapeIdentifyData = {
      type: "shape-3d-identify",
      targetShape: item.target.imageType,
      options: item.options.map((o) => o.imageType),
      correctIndex: correctIdx,
    };

    return {
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "quiz" as const,
      conceptKey: "shape-3d-identify" as ConceptKey,
      difficulty: 1 as const,
      data,
      contextHint: correctOption?.context,
    };
  });
}

// ── Ch10: 3D → 2D tracing ─────────────────────────────
// Flash data[] array — each element is a sub-question → one Activity each.

interface FlashVisSelItem {
  source: string;
  options: string[];
  answer: string;
}

function adaptVisualSelection(p: FlashProblem): Activity[] {
  const items = p.data as FlashVisSelItem[] | undefined;
  if (!items || items.length === 0) return [];

  const results: Activity[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const shape3d = normalizeShape3d(item.source);
    const footprint = normalize2d(item.answer);
    if (!shape3d || !footprint) continue;

    const data: Shape3Dto2DData = {
      type: "shape-3d-to-2d",
      shape3d,
      correctFootprint: footprint,
      distractors: item.options.filter((o) => o !== item.answer),
    };

    results.push({
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "interactive",
      conceptKey: "shape-3d-to-2d",
      difficulty: 1,
      data,
      contextHint: item.source,
    });
  }

  return results;
}

// ── Ch10: Matching shapes to names ─────────────────────
// Each pair → one Activity (pick the name for this shape).
// contextHint = the shape's real-world object context.

interface FlashMatchData {
  shapes: { id: string; imageType: string; context: string }[];
  names: string[];
}

function adaptMatching(p: FlashProblem): Activity[] {
  const matchData = p.data as FlashMatchData | undefined;
  const pairs = p.pairs as [string, string][] | undefined;
  if (!matchData || !pairs || pairs.length === 0) return [];

  return pairs.flatMap((pair, i) => {
    const shape = matchData.shapes.find((s) => s.id === pair[0]);
    if (!shape) return [];

    const data: ShapeIdentifyData = {
      type: "shape-3d-identify",
      targetShape: shape.imageType,
      options: matchData.names,
      correctIndex: matchData.names.indexOf(pair[1]),
    };

    return [{
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "quiz" as const,
      conceptKey: "shape-3d-identify" as ConceptKey,
      difficulty: 1 as const,
      data,
      contextHint: shape.context,
    }];
  });
}

// ── Ch11: Capacity unit counting ───────────────────────
// All containers form one Activity (comparison question).
// contextHint = comma-joined container contexts.

interface FlashUnitCountItem {
  target: { imageType: string; context: string };
  cups: number;
}

function adaptUnitCounting(p: FlashProblem): Activity[] {
  const items = p.items as FlashUnitCountItem[] | undefined;
  if (!items || items.length === 0) return [];

  const data: CapacityData = {
    type: "compare-capacity",
    containers: items.map((item) => ({
      label: item.target.context,
      imageId: item.target.imageType,
      capacityCups: item.cups,
    })),
    question: "which-more",
    correctAnswer: Math.max(...items.map((i) => i.cups)),
  };

  return [{
    id: p.id,
    type: "interactive",
    conceptKey: "compare-capacity",
    difficulty: 1,
    data,
    contextHint: items.map((i) => i.target.context).join(", "),
  }];
}

// ── Ch11: Area grid counting ───────────────────────────
// Each pair of items → one comparison Activity.
// Flash has no cell coordinates — gridRows/Cols/shapeA/shapeB remain empty
// (see FLASH_DATA_GAPS.md §3).

interface FlashAreaGridItem {
  id: string;
  shape: string;
  units: number;
}

function adaptAreaGridCounting(p: FlashProblem): Activity[] {
  const items = p.items as FlashAreaGridItem[] | undefined;
  if (!items || items.length < 2) return [];

  // Emit one Activity per adjacent pair so the child compares two shapes at a time
  const results: Activity[] = [];

  for (let i = 0; i < items.length - 1; i++) {
    const a = items[i]!;
    const b = items[i + 1]!;

    const data: AreaGridData = {
      type: "compare-area",
      mode: "count-compare",
      gridRows: 0,  // GAP — no coordinate data in Flash JSON
      gridCols: 0,
      shapeA: [],
      shapeB: [],
      shapeLabels: ["Shape A", "Shape B"],
      shapeColors: ["blue", "orange"],
      shapeCounts: [
        { label: "Shape A", count: a.units, color: "blue" },
        { label: "Shape B", count: b.units, color: "orange" },
      ],
      question: "which-larger",
      correctAnswer: a.units >= b.units ? "Shape A" : "Shape B",
    };

    results.push({
      id: i === 0 ? p.id : `${p.id}-pair${i + 1}`,
      type: "interactive",
      conceptKey: "compare-area",
      difficulty: 1,
      data,
      contextHint: `${a.shape} vs ${b.shape}`,
    });
  }

  return results;
}

// ── Ch12: Split-tree addition → GuidedBoxProblem ───────
// Single problem per Flash entry (no sub-items).

interface FlashSplitAddData {
  equation: string;
  steps: { description: string; value?: number; parts?: number[]; sum?: number }[];
}

function adaptSplitTreeAddition(p: FlashProblem): Activity[] {
  const raw = p.data as FlashSplitAddData | undefined;
  if (!raw) return [];

  const [aStr, bStr] = raw.equation.split("+").map((s) => s.trim());
  const a = parseInt(aStr!, 10);
  const b = parseInt(bStr!, 10);
  if (isNaN(a) || isNaN(b)) return [];

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

  return [{ id: p.id, type: "interactive", conceptKey: "addition-make-10", difficulty: 1, data }];
}

// ── Ch13: Split-tree subtraction → GuidedBoxProblem ────

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

  const [minStr, subStr] = raw.equation.split("-").map((s) => s.trim());
  const minuend = parseInt(minStr!, 10);
  const subtrahend = parseInt(subStr!, 10);
  if (isNaN(minuend) || isNaN(subtrahend)) return [];

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

  return [{ id: p.id, type: "interactive", conceptKey: "subtraction-use-10", difficulty: 1, data }];
}

// ── Ch12/13: Fill-in-the-blanks ────────────────────────
// Each item → one single-step GuidedBoxProblem.

interface FlashFIBItem {
  equation: string;
  answer: number;
}

function adaptFillInBlanks(p: FlashProblem): Activity[] {
  const items = p.items as FlashFIBItem[] | undefined;
  if (!items || items.length === 0) return [];

  return items.map((item, i) => {
    const isAdd = item.equation.includes("+");
    const conceptKey: ConceptKey = isAdd ? "addition-make-10" : "subtraction-use-10";

    const data: GuidedBoxProblem = {
      type: isAdd ? "addition" : "subtraction",
      equation: item.equation.replace("__", "?"),
      steps: [
        {
          id: `${p.id}-${i}-s1`,
          template: item.equation.replace("__", "{0}"),
          blanks: [{ index: 0, correctValue: item.answer }],
          revealAfterPrevious: false,
        },
      ],
      finalAnswer: item.answer,
    };

    return {
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "quiz" as const,
      conceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

// ── Ch14: Ten-grouping ─────────────────────────────────
// Each item → one Activity.

interface FlashTenGroupItem {
  stacksOfTen: number;
  total: number;
}

function adaptTenGrouping(p: FlashProblem): Activity[] {
  const items = p.items as FlashTenGroupItem[] | undefined;
  if (!items || items.length === 0) return [];

  return items.map((item, i) => {
    const data: PlaceValueData = {
      type: "place-value-group",
      totalItems: item.total,
      expectedTens: item.stacksOfTen,
      expectedOnes: 0,
      visualType: "blocks",
    };

    return {
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-group" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

// ── Ch14: Place-value counting ─────────────────────────
// Each item → one Activity.

interface FlashPVCountItem {
  tens: number;
  ones: number;
  total: number;
}

function adaptPlaceValueCounting(p: FlashProblem): Activity[] {
  const items = p.items as FlashPVCountItem[] | undefined;
  if (!items || items.length === 0) return [];

  return items.map((item, i) => {
    const data: PlaceValueData = {
      type: "place-value-group",
      totalItems: item.total,
      expectedTens: item.tens,
      expectedOnes: item.ones,
      visualType: "sticks",
    };

    return {
      id: i === 0 ? p.id : `${p.id}-${i + 1}`,
      type: "interactive" as const,
      conceptKey: "place-value-group" as ConceptKey,
      difficulty: 1 as const,
      data,
    };
  });
}

// ── Helpers ────────────────────────────────────────────

function normalizeShape3d(
  s: string,
): "cube" | "cylinder" | "sphere" | "prism" | "cuboid" | null {
  const map: Record<string, "cube" | "cylinder" | "sphere" | "prism" | "cuboid"> = {
    cube: "cube", cylinder: "cylinder", sphere: "sphere",
    ball: "sphere", prism: "prism", cuboid: "cuboid",
  };
  return map[s.toLowerCase()] ?? null;
}

function normalize2d(
  s: string,
): "square" | "circle" | "triangle" | "rectangle" | null {
  const map: Record<string, "square" | "circle" | "triangle" | "rectangle"> = {
    square: "square", circle: "circle", triangle: "triangle", rectangle: "rectangle",
  };
  return map[s.toLowerCase()] ?? null;
}

// ── Batch adapter ──────────────────────────────────────

export function adaptAllFlashChapters(chapters: FlashChapter[]): AdaptedChapter[] {
  return chapters.map(adaptFlashChapter);
}
