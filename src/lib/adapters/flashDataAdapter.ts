/**
 * Thin translation layer: Flash-extracted JSON → App types.
 *
 * The JSON files in data/chapter_10–14.json were extracted from the
 * El-Moasser workbook PDFs via NotebookLM. They use a flat, varied
 * schema per problem type. This adapter maps them into our app's
 * typed interfaces WITHOUT modifying the source JSON.
 *
 * Unmappable fields are logged to console and catalogued in
 * docs/FLASH_DATA_GAPS.md.
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

// ── Flash JSON shapes (as they actually appear in the files) ──

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
  // Polymorphic — shape depends on `type`
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
  /** Problems that couldn't be mapped — kept for reference */
  skipped: { id: string; type: string; reason: string }[];
}

// ── Main entry point ───────────────────────────────────

export function adaptFlashChapter(raw: FlashChapter): AdaptedChapter {
  const chapterId = `ch${raw.chapter}`;
  const activities: Activity[] = [];
  const skipped: { id: string; type: string; reason: string }[] = [];

  for (const p of raw.problems) {
    const result = adaptProblem(p, chapterId);
    if (result) {
      activities.push(result);
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

// ── Per-type adapters ──────────────────────────────────

function adaptProblem(
  p: FlashProblem,
  _chapterId: string,
): Activity | null {
  switch (p.type) {
    case "multiple-choice-visual":
      return adaptMultipleChoiceVisual(p);
    case "visual-selection":
      return adaptVisualSelection(p);
    case "matching":
      return adaptMatching(p);
    case "unit-counting":
      return adaptUnitCounting(p);
    case "area-grid-counting":
      return adaptAreaGridCounting(p);
    case "split-tree-addition":
      return adaptSplitTreeAddition(p);
    case "split-tree-subtraction":
      return adaptSplitTreeSubtraction(p);
    case "fill-in-the-blanks":
      return adaptFillInBlanks(p);
    case "ten-grouping":
      return adaptTenGrouping(p);
    case "place-value-counting":
      return adaptPlaceValueCounting(p);
    // Types we can't map yet
    case "counting-composite":
    case "ordering":
    case "area-comparison-visual":
    case "word-problem":
    case "result-finding":
      return null;
    default:
      return null;
  }
}

// ── Ch10: 3D shape identification ──────────────────────

interface FlashMCVItem {
  target: { imageType: string; imageValue?: string };
  options: { id: string; imageType: string; context: string }[];
  answer: string;
}

function adaptMultipleChoiceVisual(p: FlashProblem): Activity | null {
  const items = p.items as FlashMCVItem[] | undefined;
  if (!items || items.length === 0) return null;

  // Each "item" in the Flash data is a self-contained sub-question.
  // We take the first one; callers can expand to handle multiple later.
  const item = items[0]!;
  const correctIdx = item.options.findIndex((o) => o.id === item.answer);

  const data: ShapeIdentifyData = {
    type: "shape-3d-identify",
    targetShape: item.target.imageType,
    options: item.options.map((o) => o.imageType),
    correctIndex: correctIdx,
  };

  return {
    id: p.id,
    type: "quiz",
    conceptKey: "shape-3d-identify",
    difficulty: 1,
    data,
  };
}

// ── Ch10: 3D → 2D tracing ─────────────────────────────

interface FlashVisSelItem {
  source: string;
  options: string[];
  answer: string;
}

function adaptVisualSelection(p: FlashProblem): Activity | null {
  const items = p.data as FlashVisSelItem[] | undefined;
  if (!items || items.length === 0) return null;

  // Expand each sub-item into its own activity
  // For now, take the first one
  const item = items[0]!;
  const distractors = item.options.filter((o) => o !== item.answer);

  const shape3d = normalizeShape3d(item.source);
  const footprint = normalize2d(item.answer);

  if (!shape3d || !footprint) return null;

  const data: Shape3Dto2DData = {
    type: "shape-3d-to-2d",
    shape3d,
    correctFootprint: footprint,
    distractors,
  };

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "shape-3d-to-2d",
    difficulty: 1,
    data,
  };
}

// ── Ch10: Matching shapes to names ─────────────────────
// No direct app type — we create a series of ShapeIdentifyData as a
// "pick the name" quiz. This is a lossy mapping.

interface FlashMatchData {
  shapes: { id: string; imageType: string; context: string }[];
  names: string[];
}

function adaptMatching(p: FlashProblem): Activity | null {
  const matchData = p.data as FlashMatchData | undefined;
  const pairs = p.pairs as [string, string][] | undefined;
  if (!matchData || !pairs || pairs.length === 0) return null;

  // Map to ShapeIdentifyData using the first pair
  const pair = pairs[0]!;
  const shape = matchData.shapes.find((s) => s.id === pair[0]);
  if (!shape) return null;

  const data: ShapeIdentifyData = {
    type: "shape-3d-identify",
    targetShape: shape.imageType,
    options: matchData.names,
    correctIndex: matchData.names.indexOf(pair[1]),
  };

  return {
    id: p.id,
    type: "quiz",
    conceptKey: "shape-3d-identify",
    difficulty: 1,
    data,
  };
}

// ── Ch11: Capacity unit counting ───────────────────────

interface FlashUnitCountItem {
  target: { imageType: string; context: string };
  cups: number;
}

function adaptUnitCounting(p: FlashProblem): Activity | null {
  const items = p.items as FlashUnitCountItem[] | undefined;
  if (!items || items.length === 0) return null;

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

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "compare-capacity",
    difficulty: 1,
    data,
  };
}

// ── Ch11: Area grid counting ───────────────────────────
// Flash data only has total unit counts, not actual grid cells.
// We create an AreaGridData with empty cell arrays — the component
// will need to handle "count-only" mode.

interface FlashAreaGridItem {
  id: string;
  shape: string;
  units: number;
}

function adaptAreaGridCounting(p: FlashProblem): Activity | null {
  const items = p.items as FlashAreaGridItem[] | undefined;
  if (!items || items.length < 2) return null;

  const sorted = [...items].sort((a, b) => a.units - b.units);

  const data: AreaGridData = {
    type: "compare-area",
    gridRows: 0,   // GAP: Flash data has no grid dimensions
    gridCols: 0,   // GAP: Flash data has no grid dimensions
    shapeA: [],    // GAP: Flash data has no cell coordinates
    shapeB: [],    // GAP: Flash data has no cell coordinates
    question: "which-larger",
    correctAnswer: sorted[sorted.length - 1]!.units,
  };

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "compare-area",
    difficulty: 1,
    data,
  };
}

// ── Ch12: Split-tree addition → GuidedBoxProblem ───────

interface FlashSplitAddData {
  equation: string;
  steps: { description: string; value?: number; parts?: number[]; sum?: number }[];
}

function adaptSplitTreeAddition(p: FlashProblem): Activity | null {
  const raw = p.data as FlashSplitAddData | undefined;
  if (!raw) return null;

  const [aStr, bStr] = raw.equation.split("+").map((s) => s.trim());
  const a = parseInt(aStr!, 10);
  const b = parseInt(bStr!, 10);
  if (isNaN(a) || isNaN(b)) return null;

  // Determine which number is closer to 10 (the "other" that receives)
  const other = a >= b ? a : b;
  const target = a >= b ? b : a;
  const give = 10 - other;
  const keep = target - give;
  const sum = a + b;

  const guided: GuidedBoxProblem = {
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

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "addition-make-10",
    difficulty: 1,
    data: guided as unknown as Activity["data"],
  };
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

function adaptSplitTreeSubtraction(p: FlashProblem): Activity | null {
  const raw = p.data as FlashSplitSubData | undefined;
  if (!raw) return null;

  const [minStr, subStr] = raw.equation.split("-").map((s) => s.trim());
  const minuend = parseInt(minStr!, 10);
  const subtrahend = parseInt(subStr!, 10);
  if (isNaN(minuend) || isNaN(subtrahend)) return null;

  const dropTo10 = minuend - 10;
  const remaining = subtrahend - dropTo10;
  const result = 10 - remaining;

  const guided: GuidedBoxProblem = {
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

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "subtraction-use-10",
    difficulty: 1,
    data: guided as unknown as Activity["data"],
  };
}

// ── Ch12/13: Fill-in-the-blanks (simple equations) ─────
// These are standalone equation drills, not multi-step.
// Map each item to a minimal GuidedBoxProblem with 1 step.

interface FlashFIBItem {
  equation: string;
  answer: number;
}

function adaptFillInBlanks(p: FlashProblem): Activity | null {
  const items = p.items as FlashFIBItem[] | undefined;
  if (!items || items.length === 0) return null;

  const item = items[0]!;
  const isAdd = item.equation.includes("+");
  const conceptKey: ConceptKey = isAdd
    ? "addition-make-10"
    : "subtraction-use-10";

  const guided: GuidedBoxProblem = {
    type: isAdd ? "addition" : "subtraction",
    equation: item.equation.replace("__", "?"),
    steps: [
      {
        id: `${p.id}-s1`,
        template: item.equation.replace("__", "{0}"),
        blanks: [{ index: 0, correctValue: item.answer }],
        revealAfterPrevious: false,
      },
    ],
    finalAnswer: item.answer,
  };

  return {
    id: p.id,
    type: "quiz",
    conceptKey,
    difficulty: 1,
    data: guided as unknown as Activity["data"],
  };
}

// ── Ch14: Ten-grouping ─────────────────────────────────

interface FlashTenGroupItem {
  stacksOfTen: number;
  total: number;
}

function adaptTenGrouping(p: FlashProblem): Activity | null {
  const items = p.items as FlashTenGroupItem[] | undefined;
  if (!items || items.length === 0) return null;

  const item = items[0]!;
  const data: PlaceValueData = {
    type: "place-value-group",
    totalItems: item.total,
    expectedTens: item.stacksOfTen,
    expectedOnes: 0,
    visualType: "blocks",
  };

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "place-value-group",
    difficulty: 1,
    data,
  };
}

// ── Ch14: Place-value counting ─────────────────────────

interface FlashPVCountItem {
  tens: number;
  ones: number;
  total: number;
}

function adaptPlaceValueCounting(p: FlashProblem): Activity | null {
  const items = p.items as FlashPVCountItem[] | undefined;
  if (!items || items.length === 0) return null;

  const item = items[0]!;
  const data: PlaceValueData = {
    type: "place-value-group",
    totalItems: item.total,
    expectedTens: item.tens,
    expectedOnes: item.ones,
    visualType: "sticks",
  };

  return {
    id: p.id,
    type: "interactive",
    conceptKey: "place-value-group",
    difficulty: 1,
    data,
  };
}

// ── Helpers ────────────────────────────────────────────

function normalizeShape3d(
  s: string,
): "cube" | "cylinder" | "sphere" | "prism" | "cuboid" | null {
  const map: Record<string, "cube" | "cylinder" | "sphere" | "prism" | "cuboid"> = {
    cube: "cube",
    cylinder: "cylinder",
    sphere: "sphere",
    ball: "sphere",
    prism: "prism",
    cuboid: "cuboid",
  };
  return map[s.toLowerCase()] ?? null;
}

function normalize2d(
  s: string,
): "square" | "circle" | "triangle" | "rectangle" | null {
  const map: Record<string, "square" | "circle" | "triangle" | "rectangle"> = {
    square: "square",
    circle: "circle",
    triangle: "triangle",
    rectangle: "rectangle",
  };
  return map[s.toLowerCase()] ?? null;
}

// ── Batch adapter for all chapters ─────────────────────

export function adaptAllFlashChapters(
  chapters: FlashChapter[],
): AdaptedChapter[] {
  return chapters.map(adaptFlashChapter);
}
