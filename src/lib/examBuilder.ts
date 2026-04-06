import assessmentsRaw from "../../data/assessments.json";
import { storage } from "./storage";
import { generateAreaGrid } from "./generators/areaGridGenerator";
import { generateCapacity } from "./generators/capacityGenerator";
import { generateClockProblem, getHourAngle } from "./generators/clockGenerator";
import {
  generateAllMake10Problems,
  generateAllUse10Problems,
} from "./generators/guidedBoxGenerator";
import { generateFindNumber } from "./generators/hundredsChartGenerator";
import { generateShapeIdentify } from "./generators/shapeGenerator";
import { generateWordProblem } from "./generators/wordProblemGenerator";
import type {
  Activity,
  AreaGridData,
  CapacityData,
  MixedWordProblemData,
  Shape3Dto2DData,
  TellTimeData,
} from "../types/curriculum";

const EXAM_COUNT = 10;
const ACTIVITIES_PER_EXAM = 6;

interface RawAssessment {
  id: string;
  title: string;
  problems: unknown[];
}

interface ExamSet {
  generatedAt: string;
  assessments: BuiltAssessment[];
}

export interface BuiltAssessment {
  id: string;
  title: string;
  activities: Activity[];
}

export function loadOrCreateExamSet(): BuiltAssessment[] {
  const cached = storage.loadExamPractice<ExamSet>();
  if (cached?.assessments?.length) {
    return cached.assessments;
  }

  const built = buildExamAssessments();
  storage.saveExamPractice<ExamSet>({
    generatedAt: new Date().toISOString(),
    assessments: built,
  });
  return built;
}

export function regenerateExamSet(): BuiltAssessment[] {
  const built = buildExamAssessments();
  storage.saveExamPractice<ExamSet>({
    generatedAt: new Date().toISOString(),
    assessments: built,
  });
  return built;
}

function buildExamAssessments(): BuiltAssessment[] {
  const raw = assessmentsRaw as RawAssessment[];
  const built = raw.map((assessment, index) => {
    const adapted = adaptAssessment(assessment, index);
    return {
      id: assessment.id,
      title: assessment.title || `Assessment ${index + 1}`,
      activities: fillToBalancedAssessment(adapted.activities, index),
    };
  });

  while (built.length < EXAM_COUNT) {
    const index = built.length;
    built.push({
      id: `generated_${index + 1}`,
      title: `Assessment ${index + 1}`,
      activities: createGeneratedBalancedAssessment(index),
    });
  }

  return built.slice(0, EXAM_COUNT);
}

function adaptAssessment(assessment: RawAssessment, assessmentIndex: number): BuiltAssessment {
  const activities: Activity[] = [];
  const problems = Array.isArray(assessment.problems) ? assessment.problems : [];

  problems.forEach((problem, problemIndex) => {
    activities.push(...adaptAssessmentProblem(problem, assessmentIndex, problemIndex));
  });

  return {
    id: assessment.id,
    title: assessment.title,
    activities,
  };
}

function adaptAssessmentProblem(problem: unknown, assessmentIndex: number, problemIndex: number): Activity[] {
  if (!problem || typeof problem !== "object" || !("type" in problem)) return [];

  const raw = problem as Record<string, unknown>;
  const baseId = String(raw.id ?? `assessment-${assessmentIndex + 1}-${problemIndex + 1}`);
  const type = String(raw.type);

  switch (type) {
    case "analog-clock-read-multiple": {
      const items = Array.isArray(raw.items) ? raw.items as Array<Record<string, unknown>> : [];
      return items.flatMap((item, itemIndex) => {
        const time = typeof item.time === "string" ? item.time : null;
        const data = time ? createReadTimeData(time) : null;
        if (!data) return [];
        return [createActivity(`${baseId}-${itemIndex + 1}`, "tell-time", data)];
      });
    }

    case "shape-footprint-match": {
      const pairs = Array.isArray(raw.pairs) ? raw.pairs as Array<Record<string, unknown>> : [];
      return pairs.flatMap((pair, pairIndex) => {
        const shape3d = normalize3d(String(pair["3d"] ?? ""));
        const footprint = normalize2d(String(pair.face ?? ""));
        if (!shape3d || !footprint) return [];

        const data: Shape3Dto2DData = {
          type: "shape-3d-to-2d",
          shape3d,
          correctFootprint: footprint,
          distractors: ["square", "circle", "triangle", "rectangle"].filter((value) => value !== footprint),
        };

        return [createActivity(`${baseId}-${pairIndex + 1}`, "shape-3d-to-2d", data)];
      });
    }

    case "area-comparison": {
      const items = Array.isArray(raw.items) ? raw.items as Array<Record<string, unknown>> : [];
      if (items.length < 2) return [];
      const first = items[0]!;
      const second = items[1]!;
      const answer = typeof raw.answer === "string" ? raw.answer : String(first.color ?? "A");
      const data: AreaGridData = {
        type: "compare-area",
        mode: "count-compare",
        gridRows: 0,
        gridCols: 0,
        shapeA: [],
        shapeB: [],
        shapeLabels: [String(first.color ?? "A"), String(second.color ?? "B")],
        shapeColors: ["blue", "orange"],
        shapeCounts: [
          { label: String(first.color ?? "A"), count: Number(first.units ?? 0), color: "blue" },
          { label: String(second.color ?? "B"), count: Number(second.units ?? 0), color: "orange" },
        ],
        question: "which-larger",
        correctAnswer: answer,
      };
      return [createActivity(baseId, "compare-area", data)];
    }

    case "subtraction-word-problem": {
      const instruction = typeof raw.instruction === "string" ? raw.instruction : "Solve the problem.";
      const answer = Number(raw.answer ?? 0);
      const guessedInitial = guessLeadingNumber(instruction) ?? answer + 9;
      const guessedRemoved = guessedInitial - answer;
      const data: MixedWordProblemData = {
        type: "add-sub-mixed",
        storyAr: instruction,
        storyEn: instruction,
        operation: "-",
        operands: [guessedInitial, guessedRemoved],
        correctAnswer: answer,
        imageId: "children",
      };
      return [createActivity(baseId, "add-sub-mixed", data)];
    }

    case "capacity-math": {
      const instruction = typeof raw.instruction === "string" ? raw.instruction : "";
      const numbers = instruction.match(/\d+/g)?.map((value) => parseInt(value, 10)) ?? [];
      const first = numbers[0] ?? 8;
      const second = numbers[1] ?? 6;
      const data: CapacityData = {
        type: "compare-capacity",
        mode: "difference",
        containers: [
          { id: "a", label: "A", imageId: "jug", capacityCups: second },
          { id: "b", label: "B", imageId: "bottle", capacityCups: first },
        ],
        question: "difference",
        correctAnswer: Number(raw.answer ?? Math.abs(first - second)),
      };
      return [createActivity(baseId, "compare-capacity", data)];
    }

    case "3d-face-tracing": {
      const answer = normalize3d(String(raw.answer ?? ""));
      if (!answer) return [];
      const footprint = answer === "cylinder" ? "circle" : answer === "prism" ? "triangle" : "square";
      const data: Shape3Dto2DData = {
        type: "shape-3d-to-2d",
        shape3d: answer,
        correctFootprint: footprint,
        distractors: ["square", "circle", "triangle", "rectangle"].filter((value) => value !== footprint),
      };
      return [createActivity(baseId, "shape-3d-to-2d", data)];
    }

    case "analog-clock-read-mixed": {
      const items = Array.isArray(raw.items) ? raw.items as string[] : [];
      return items.flatMap((time, itemIndex) => {
        const data = createReadTimeData(time);
        return data ? [createActivity(`${baseId}-${itemIndex + 1}`, "tell-time", data)] : [];
      });
    }

    default:
      return [];
  }
}

function fillToBalancedAssessment(existing: Activity[], seed: number): Activity[] {
  const capped = existing.slice(0, ACTIVITIES_PER_EXAM);
  if (capped.length >= ACTIVITIES_PER_EXAM) return capped;

  const fallback = createGeneratedBalancedAssessment(seed);
  for (const activity of fallback) {
    if (capped.length >= ACTIVITIES_PER_EXAM) break;
    capped.push(activity);
  }

  return capped;
}

function createGeneratedBalancedAssessment(seed: number): Activity[] {
  const make10 = generateAllMake10Problems()[seed % generateAllMake10Problems().length]!;
  const use10 = generateAllUse10Problems()[seed % generateAllUse10Problems().length]!;

  return [
    createActivity(`exam-shape-${seed}`, "shape-3d-identify", generateShapeIdentify(), "quiz"),
    createActivity(
      `exam-compare-${seed}`,
      seed % 2 === 0 ? "compare-area" : "compare-capacity",
      seed % 2 === 0 ? generateAreaGrid(2) : generateCapacity("compare-two", 2),
    ),
    createActivity(`exam-make10-${seed}`, "guided-box-make10", make10, "quiz"),
    createActivity(`exam-use10-${seed}`, "guided-box-sub10", use10, "quiz"),
    createActivity(`exam-place-${seed}`, "place-value-hundreds-chart", generateFindNumber()),
    createActivity(
      `exam-mixed-${seed}`,
      seed % 2 === 0 ? "add-sub-mixed" : "tell-time",
      seed % 2 === 0 ? generateWordProblem(2) : generateClockProblem("read-time"),
    ),
  ];
}

function createActivity(
  id: string,
  conceptKey: Activity["conceptKey"],
  data: Activity["data"],
  type: Activity["type"] = "interactive",
): Activity {
  return {
    id,
    conceptKey,
    data,
    type,
    difficulty: 1,
  };
}

function createReadTimeData(time: string): TellTimeData | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = parseInt(match[1] ?? "", 10);
  const minute = parseInt(match[2] ?? "", 10);

  // Curriculum only teaches o-clock and half-past — skip unsupported times
  if (minute !== 0 && minute !== 30) {
    console.warn(`[examBuilder] Skipping unsupported clock time: ${time}`);
    return null;
  }

  const minuteLabel = minute === 0 ? "o-clock" : "half-past";

  return {
    type: "tell-time",
    mode: "read-time",
    hourHandAngle: getHourAngle(hour, minuteLabel),
    minuteHandAngle: minute * 6,
    correctHour: hour,
    correctMinuteLabel: minuteLabel,
    options: [time, `${hour}:00`, `${hour}:30`].filter((value, index, arr) => arr.indexOf(value) === index),
    correctOption: time,
  };
}

function normalize3d(value: string): Shape3Dto2DData["shape3d"] | null {
  const map: Record<string, Shape3Dto2DData["shape3d"]> = {
    cube: "cube",
    cuboid: "cuboid",
    cylinder: "cylinder",
    prism: "prism",
    sphere: "sphere",
    ball: "sphere",
  };
  return map[value.toLowerCase()] ?? null;
}

function normalize2d(value: string): Shape3Dto2DData["correctFootprint"] | null {
  const map: Record<string, Shape3Dto2DData["correctFootprint"]> = {
    square: "square",
    rectangle: "rectangle",
    circle: "circle",
    triangle: "triangle",
  };
  return map[value.toLowerCase()] ?? null;
}

function guessLeadingNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}
