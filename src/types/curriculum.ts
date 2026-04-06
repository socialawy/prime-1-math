// ============================================
// CURRICULUM CONTENT (Static, shipped with app)
// ============================================

export interface Chapter {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  unlockAfter?: string;
}

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  conceptKey: ConceptKey;
  activities: Activity[];
}

export type ConceptKey =
  | "shape-3d-identify"
  | "shape-3d-to-2d"
  | "compare-capacity"
  | "compare-area"
  | "addition-make-10"
  | "subtraction-use-10"
  | "place-value-group"
  | "place-value-hundreds-chart"
  | "place-value-number-line"
  | "compose-shapes"
  | "tell-time"
  | "add-sub-mixed";

export interface Activity {
  id: string;
  type: "interactive" | "quiz" | "drag-drop" | "coloring";
  conceptKey: ConceptKey;
  difficulty: 1 | 2 | 3;
  data: ActivityData;
  /** Real-world object name from source data (e.g. "cheese-wedge", "tennis-ball").
   *  Components can use this for flavor text or icon selection. */
  contextHint?: string;
}

// Polymorphic activity payloads
export type ActivityData =
  | ShapeIdentifyData
  | Shape3Dto2DData
  | CapacityData
  | AreaGridData
  | Make10Data
  | Use10SubtractData
  | PlaceValueData
  | HundredsChartData
  | NumberLineData
  | ComposeShapesData
  | TellTimeData
  | MixedWordProblemData
  | GuidedBoxProblem;

// --- Payload types ---

export interface ShapeIdentifyData {
  type: "shape-3d-identify";
  targetShape: string;
  options: string[];
  correctIndex: number;
}

export interface Shape3Dto2DData {
  type: "shape-3d-to-2d";
  shape3d: "cube" | "cylinder" | "sphere" | "prism" | "cuboid";
  correctFootprint: "square" | "circle" | "triangle" | "rectangle";
  distractors: string[];
}

export interface CapacityData {
  type: "compare-capacity";
  containers: {
    label: string;
    imageId: string;
    capacityCups: number;
  }[];
  question: "order" | "difference" | "which-more";
  correctAnswer: number | number[];
}

export interface AreaGridData {
  type: "compare-area";
  gridRows: number;
  gridCols: number;
  shapeA: GridCell[];
  shapeB: GridCell[];
  question: "which-larger" | "how-many-more";
  correctAnswer: number;
}

export interface GridCell {
  row: number;
  col: number;
}

export interface Make10Data {
  type: "addition-make-10";
  addendA: number;
  addendB: number;
  splitFrom: "A" | "B";
  splitParts: [number, number];
  targetSum: number;
  tenFrameInitial: number;
}

export interface Use10SubtractData {
  type: "subtraction-use-10";
  minuend: number;
  subtrahend: number;
  splitParts: [number, number];
  intermediateResult: 10;
  finalResult: number;
}

export interface PlaceValueData {
  type: "place-value-group";
  totalItems: number;
  expectedTens: number;
  expectedOnes: number;
  visualType: "blocks" | "sticks" | "stars";
  mode?: "group-then-count" | "count-only";
}

export interface HundredsChartData {
  type: "place-value-hundreds-chart";
  mode: "fill-missing" | "jump-by-10" | "color-pattern" | "find-number";
  // fill-missing: which cells are hidden
  missingCells?: number[];
  // jump-by-10: the column root and which cells in the column are blank
  jumpStart?: number;
  jumpDirection?: "down" | "up";
  jumpBlanks?: number[];
  // color-pattern & jump-by-10: pre-colored cells
  preHighlighted?: number[];
  // color-pattern: cells the child must color
  targetCells?: number[];
  patternRule?: string;
  // find-number: place-value riddle
  riddle?: string;
  correctCell?: number;
}

export interface NumberLineData {
  type: "place-value-number-line";
  rangeStart: number;
  rangeEnd: number;
  markedPoints: number[];
  missingPoints: number[];
  jumpSize: 1 | 2 | 5 | 10;
  showJumpArrows?: boolean;
}

export interface ComposeShapesData {
  type: "compose-shapes";
  targetShape: string;
  availablePieces: ShapePiece[];
  correctCombination: string[];
}

export interface ShapePiece {
  id: string;
  shape: "triangle" | "square" | "rectangle" | "semicircle";
  rotation: number;
}

export interface TellTimeData {
  type: "tell-time";
  hourHandAngle: number;
  minuteHandAngle: number;
  correctHour: number;
  correctMinuteLabel: "o-clock" | "half-past";
}

export interface MixedWordProblemData {
  type: "add-sub-mixed";
  storyAr: string;
  storyEn: string;
  operation: "+" | "-";
  operands: [number, number];
  correctAnswer: number;
  imageId: string;
}

// ============================================
// STUDENT PROGRESS (Persisted to localStorage)
// ============================================

export interface StudentProfile {
  id: string;
  name: string;
  avatarId: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface ProgressStore {
  student: StudentProfile;
  chapterProgress: Record<string, ChapterProgress>;
  totalStars: number;
  streakDays: number;
  lastSessionDate: string;
}

export interface ChapterProgress {
  chapterId: string;
  status: "locked" | "available" | "in-progress" | "completed";
  lessonsProgress: Record<string, LessonProgress>;
  bestScore: number;
  starsEarned: 0 | 1 | 2 | 3;
}

export interface LessonProgress {
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  activitiesCompleted: string[];
  attempts: AttemptRecord[];
  bestScore: number;
}

export interface AttemptRecord {
  timestamp: string;
  score: number;
  timeSpentMs: number;
  mistakeCount: number;
  activitiesDetail: {
    activityId: string;
    correct: boolean;
    attempts: number;
    timeMs: number;
  }[];
}

// ============================================
// ACTIVITY RESULTS (passed up from widgets)
// ============================================

export interface ActivityResult {
  activityId: string;
  correct: boolean;
  attempts: number;
  timeMs: number;
  score: number;
}

// ============================================
// APP SETTINGS
// ============================================

export interface AppSettings {
  language: "ar" | "en";
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export type SoundEffect =
  | "pop"
  | "ding"
  | "whoosh"
  | "correct"
  | "try-again"
  | "stars-earned";

// ============================================
// GUIDED BOX FILL (Ch12 + Ch13 exam format)
// ============================================

export interface GuidedBoxProblem {
  type: "addition" | "subtraction";
  equation: string;
  steps: GuidedStep[];
  finalAnswer: number;
}

export interface GuidedStep {
  id: string;
  template: string;
  blanks: BlankSlot[];
  revealAfterPrevious: boolean;
}

export interface BlankSlot {
  index: number;
  correctValue: number;
  hint?: string;
}

// ============================================
// SPLIT TREE (Ch12 + Ch13 learn mode)
// ============================================

export interface SplitTreeProblem {
  mode: "addition" | "subtraction";
  numberA: number;
  numberB: number;
  allowSplitChoice: boolean;
  presetSplit?: "A" | "B";
  expectedAnswer: number;
}
