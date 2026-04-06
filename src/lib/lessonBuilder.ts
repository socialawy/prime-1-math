import chapter10Raw from "../../data/chapter_10.json";
import chapter11Raw from "../../data/chapter_11.json";
import chapter12Raw from "../../data/chapter_12.json";
import chapter13Raw from "../../data/chapter_13.json";
import chapter14Raw from "../../data/chapter_14.json";
import chapter15Raw from "../../data/chapter_15.json";
import chapter16Raw from "../../data/chapter_16.json";
import chapter17Raw from "../../data/chapter_17.json";
import { adaptFlashChapter } from "./adapters/flashDataAdapter";
import { generateAreaGrid } from "./generators/areaGridGenerator";
import { generateBlockGrouper } from "./generators/blockGrouperGenerator";
import { generateCapacity } from "./generators/capacityGenerator";
import { generateClockProblem } from "./generators/clockGenerator";
import {
  generateAllMake10Problems,
  generateAllUse10Problems,
} from "./generators/guidedBoxGenerator";
import {
  generateFillMissing,
  generateFindNumber,
  generateJumpBy10,
} from "./generators/hundredsChartGenerator";
import { generateNumberLine } from "./generators/numberLineGenerator";
import { generateShapeComposer } from "./generators/shapeComposerGenerator";
import {
  generateShapeFootprint,
  generateShapeIdentify,
} from "./generators/shapeGenerator";
import { generateWordProblem } from "./generators/wordProblemGenerator";
import type { Activity, ActivityData, ConceptKey, GuidedBoxProblem } from "../types/curriculum";

/** Ch15-17 JSONs are arrays of sheet objects; flatten to the single-object format the adapter expects. */
function normalizeSheetArray(sheets: unknown, chapterNum: number): { chapter: number; title: string; problems: unknown[] } {
  const arr = Array.isArray(sheets) ? sheets : [sheets];
  return {
    chapter: chapterNum,
    title: `Chapter ${chapterNum}`,
    problems: arr.flatMap((s: Record<string, unknown>) => (s.problems as unknown[]) ?? []),
  };
}

const FLASH_CHAPTERS: Record<string, unknown> = {
  ch10: chapter10Raw,
  ch11: chapter11Raw,
  ch12: chapter12Raw,
  ch13: chapter13Raw,
  ch14: chapter14Raw,
  ch15: normalizeSheetArray(chapter15Raw, 15),
  ch16: normalizeSheetArray(chapter16Raw, 16),
  ch17: normalizeSheetArray(chapter17Raw, 17),
};

export interface BuiltLesson {
  lessonId: string;
  titleEn: string;
  titleAr: string;
  activities: Activity[];
}

export function buildLessonForChapter(chapterId: string): BuiltLesson {
  switch (chapterId) {
    case "ch10":
      return {
        lessonId: "ch10-core",
        titleEn: "Shape Revision",
        titleAr: "Shape Revision",
        activities: buildChapter10Activities(),
      };
    case "ch11":
      return {
        lessonId: "ch11-core",
        titleEn: "Compare and Measure",
        titleAr: "Compare and Measure",
        activities: buildChapter11Activities(),
      };
    case "ch12":
      return {
        lessonId: "ch12-core",
        titleEn: "Make 10",
        titleAr: "Make 10",
        activities: buildChapter12Activities(),
      };
    case "ch13":
      return {
        lessonId: "ch13-core",
        titleEn: "Use 10",
        titleAr: "Use 10",
        activities: buildChapter13Activities(),
      };
    case "ch14":
      return {
        lessonId: "ch14-core",
        titleEn: "Place Value",
        titleAr: "Place Value",
        activities: buildChapter14Activities(),
      };
    case "ch15":
      return {
        lessonId: "ch15-core",
        titleEn: "Making Shapes",
        titleAr: "Making Shapes",
        activities: buildChapter15Activities(),
      };
    case "ch16":
      return {
        lessonId: "ch16-core",
        titleEn: "Time",
        titleAr: "Time",
        activities: buildChapter16Activities(),
      };
    case "ch17":
      return {
        lessonId: "ch17-core",
        titleEn: "Word Problems",
        titleAr: "Word Problems",
        activities: buildChapter17Activities(),
      };
    default:
      return {
        lessonId: `${chapterId}-core`,
        titleEn: "Lesson",
        titleAr: "Lesson",
        activities: [],
      };
  }
}

function buildChapter10Activities(): Activity[] {
  return [
    ...Array.from({ length: 2 }, (_, index) =>
      createActivity(`ch10-identify-${index + 1}`, "shape-3d-identify", generateShapeIdentify(), "quiz"),
    ),
    ...Array.from({ length: 2 }, (_, index) =>
      createActivity(`ch10-footprint-${index + 1}`, "shape-3d-to-2d", generateShapeFootprint()),
    ),
    ...Array.from({ length: 4 }, (_, index) =>
      index % 2 === 0
        ? createActivity(`ch10-mixed-identify-${index + 1}`, "shape-3d-identify", generateShapeIdentify(), "quiz")
        : createActivity(`ch10-mixed-footprint-${index + 1}`, "shape-3d-to-2d", generateShapeFootprint()),
    ),
  ];
}

function buildChapter11Activities(): Activity[] {
  const flash = getAdaptedActivities("ch11");
  const area = flash.filter((activity) => activity.conceptKey === "compare-area");
  const capacity = flash.filter((activity) => activity.conceptKey === "compare-capacity");

  return [
    ...takeOrGenerate(area, 3, (index) =>
      createActivity(`ch11-area-${index + 1}`, "compare-area", generateAreaGrid(index < 2 ? 1 : 2)),
    ),
    ...takeOrGenerate(capacity, 3, (index) =>
      createActivity(
        `ch11-capacity-${index + 1}`,
        "compare-capacity",
        generateCapacity(index === 2 ? "difference" : "compare-two", index < 2 ? 1 : 2),
      ),
    ),
    ...takeOrGenerate(flash.slice(6), 2, (index) =>
      index % 2 === 0
        ? createActivity(`ch11-mixed-area-${index + 1}`, "compare-area", generateAreaGrid(2))
        : createActivity(`ch11-mixed-capacity-${index + 1}`, "compare-capacity", generateCapacity("order-multiple", 2)),
    ),
  ];
}

function buildChapter12Activities(): Activity[] {
  const source = getAdditionGuidedSources();
  const learn = takeOrGenerate(source, 3, (index) => {
    const generated = generateAllMake10Problems()[index % generateAllMake10Problems().length]!;
    return createGuidedActivity(`ch12-learn-${index + 1}`, "addition-make-10", generated);
  }).map((activity, index) => cloneGuidedActivity(activity, "addition-make-10", `ch12-learn-${index + 1}`));

  const practice = takeOrGenerate(source.slice(3), 5, (index) => {
    const generated = generateAllMake10Problems()[(index + 3) % generateAllMake10Problems().length]!;
    return createGuidedActivity(`ch12-practice-${index + 1}`, "guided-box-make10", generated, "quiz");
  }).map((activity, index) => cloneGuidedActivity(activity, "guided-box-make10", `ch12-practice-${index + 1}`));

  return [...learn, ...practice];
}

function buildChapter13Activities(): Activity[] {
  const source = getSubtractionGuidedSources();
  const learn = takeOrGenerate(source, 2, (index) => {
    const generated = generateAllUse10Problems()[index % generateAllUse10Problems().length]!;
    return createGuidedActivity(`ch13-learn-${index + 1}`, "subtraction-use-10", generated);
  }).map((activity, index) => cloneGuidedActivity(activity, "subtraction-use-10", `ch13-learn-${index + 1}`));

  const practice = takeOrGenerate(source.slice(2), 5, (index) => {
    const generated = generateAllUse10Problems()[(index + 2) % generateAllUse10Problems().length]!;
    return createGuidedActivity(`ch13-practice-${index + 1}`, "guided-box-sub10", generated, "quiz");
  }).map((activity, index) => cloneGuidedActivity(activity, "guided-box-sub10", `ch13-practice-${index + 1}`));

  return [...learn, ...practice];
}

function buildChapter14Activities(): Activity[] {
  const flash = getAdaptedActivities("ch14");
  const grouping = flash.filter((activity) => activity.conceptKey === "place-value-group");

  return [
    ...takeOrGenerate(grouping, 2, (index) =>
      createActivity(`ch14-group-${index + 1}`, "place-value-group", generateBlockGrouper(index === 0 ? 1 : 2)),
    ),
    createActivity("ch14-hundreds-1", "place-value-hundreds-chart", generateFillMissing(4)),
    createActivity("ch14-hundreds-2", "place-value-hundreds-chart", generateJumpBy10()),
    createActivity("ch14-hundreds-3", "place-value-hundreds-chart", generateFindNumber()),
    createActivity("ch14-numberline-1", "place-value-number-line", generateNumberLine(10, 1)),
    createActivity("ch14-numberline-2", "place-value-number-line", generateNumberLine(5, 2)),
  ];
}

function buildChapter15Activities(): Activity[] {
  const flash = getAdaptedActivities("ch15");
  const shapes = flash.filter((a) => a.conceptKey === "compose-shapes" || a.conceptKey === "shape-3d-to-2d");
  const math = flash.filter((a) => a.conceptKey === "guided-box-make10" || a.conceptKey === "guided-box-sub10");
  const area = flash.filter((a) => a.conceptKey === "compare-area");
  const capacity = flash.filter((a) => a.conceptKey === "compare-capacity");

  return [
    ...takeOrGenerate(shapes, 2, (index) =>
      createActivity(`ch15-compose-${index + 1}`, "compose-shapes", generateShapeComposer()),
    ),
    ...takeOrGenerate(math, 2, (index) =>
      createActivity(`ch15-math-${index + 1}`, "guided-box-make10",
        generateAllMake10Problems()[index % generateAllMake10Problems().length]!, "quiz"),
    ),
    ...takeOrGenerate(area, 1, (index) =>
      createActivity(`ch15-area-${index + 1}`, "compare-area", generateAreaGrid(2)),
    ),
    ...takeOrGenerate(capacity, 1, (index) =>
      createActivity(`ch15-capacity-${index + 1}`, "compare-capacity", generateCapacity("order-multiple", 2)),
    ),
    ...takeOrGenerate(flash.filter((a) => !shapes.includes(a) && !math.includes(a) && !area.includes(a) && !capacity.includes(a)), 2, (index) =>
      createActivity(`ch15-compose-extra-${index + 1}`, "compose-shapes", generateShapeComposer()),
    ),
  ];
}

function buildChapter16Activities(): Activity[] {
  const flash = getAdaptedActivities("ch16");
  const clock = flash.filter((a) => a.conceptKey === "tell-time");
  const shapes = flash.filter((a) => a.conceptKey === "shape-3d-identify" || a.conceptKey === "shape-3d-to-2d");
  const math = flash.filter((a) => a.conceptKey === "guided-box-make10" || a.conceptKey === "guided-box-sub10");
  const capacity = flash.filter((a) => a.conceptKey === "compare-capacity");

  return [
    ...takeOrGenerate(clock, 3, (index) =>
      createActivity(`ch16-read-${index + 1}`, "tell-time", generateClockProblem("read-time")),
    ),
    ...takeOrGenerate(shapes, 2, (index) =>
      createActivity(`ch16-shape-${index + 1}`, "shape-3d-identify", generateShapeIdentify(), "quiz"),
    ),
    ...takeOrGenerate(math, 2, (index) =>
      createActivity(`ch16-math-${index + 1}`, "guided-box-make10",
        generateAllMake10Problems()[index % generateAllMake10Problems().length]!, "quiz"),
    ),
    ...takeOrGenerate(capacity, 1, (index) =>
      createActivity(`ch16-capacity-${index + 1}`, "compare-capacity", generateCapacity("compare-two", 1)),
    ),
  ];
}

function buildChapter17Activities(): Activity[] {
  const flash = getAdaptedActivities("ch17");
  const wordProblems = flash.filter((a) => a.conceptKey === "add-sub-mixed");
  const placeValue = flash.filter((a) => a.conceptKey === "place-value-group" || a.conceptKey === "place-value-hundreds-chart");
  const math = flash.filter((a) => a.conceptKey === "guided-box-make10" || a.conceptKey === "guided-box-sub10");

  return [
    ...takeOrGenerate(wordProblems, 3, (index) =>
      createActivity(`ch17-word-${index + 1}`, "add-sub-mixed", generateWordProblem(index < 2 ? 1 : 2)),
    ),
    ...takeOrGenerate(placeValue, 2, (index) =>
      createActivity(`ch17-pv-${index + 1}`, "place-value-group", generateBlockGrouper(index === 0 ? 1 : 2)),
    ),
    ...takeOrGenerate(math, 2, (index) =>
      createActivity(`ch17-math-${index + 1}`, "guided-box-make10",
        generateAllMake10Problems()[index % generateAllMake10Problems().length]!, "quiz"),
    ),
    ...takeOrGenerate(flash.filter((a) => !wordProblems.includes(a) && !placeValue.includes(a) && !math.includes(a)), 1, (index) =>
      createActivity(`ch17-extra-${index + 1}`, "add-sub-mixed", generateWordProblem(2)),
    ),
  ];
}

function getAdaptedActivities(chapterId: string): Activity[] {
  const raw = FLASH_CHAPTERS[chapterId];
  if (!raw) return [];

  const adapted = adaptFlashChapter(raw as Parameters<typeof adaptFlashChapter>[0]);
  return adapted.activities;
}

function getAdditionGuidedSources(): Activity[] {
  return getAdaptedActivities("ch12").filter(
    (activity) =>
      (activity.conceptKey === "addition-make-10" || activity.conceptKey === "guided-box-make10") &&
      isGuidedBox(activity.data),
  );
}

function getSubtractionGuidedSources(): Activity[] {
  return getAdaptedActivities("ch13").filter(
    (activity) =>
      (activity.conceptKey === "subtraction-use-10" || activity.conceptKey === "guided-box-sub10") &&
      isGuidedBox(activity.data),
  );
}

function takeOrGenerate(
  existing: Activity[],
  count: number,
  generateFallback: (index: number) => Activity,
): Activity[] {
  const picked = existing.slice(0, count);
  while (picked.length < count) {
    picked.push(generateFallback(picked.length));
  }
  return picked;
}

function createActivity(
  id: string,
  conceptKey: ConceptKey,
  data: ActivityData,
  type: Activity["type"] = "interactive",
  difficulty: Activity["difficulty"] = 1,
): Activity {
  return {
    id,
    type,
    conceptKey,
    difficulty,
    data,
  };
}

function createGuidedActivity(
  id: string,
  conceptKey: Extract<
    ConceptKey,
    "addition-make-10" | "subtraction-use-10" | "guided-box-make10" | "guided-box-sub10"
  >,
  data: GuidedBoxProblem,
  type: Activity["type"] = "interactive",
): Activity {
  return createActivity(id, conceptKey, data, type);
}

function cloneGuidedActivity(
  activity: Activity,
  conceptKey: Extract<
    ConceptKey,
    "addition-make-10" | "subtraction-use-10" | "guided-box-make10" | "guided-box-sub10"
  >,
  id: string,
): Activity {
  if (!isGuidedBox(activity.data)) {
    return activity;
  }

  return {
    ...activity,
    id,
    conceptKey,
  };
}

function isGuidedBox(data: ActivityData): data is GuidedBoxProblem {
  return typeof data === "object" && data !== null && "equation" in data && "steps" in data;
}
