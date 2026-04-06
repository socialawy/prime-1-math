# Prim-1-Math (This blueprint is not the northstar, but serves as mental map)

- **Egyptian Primary 1 Math:** (Term 2) Interactive Review App

- **This is designed:** To be buildable in a day by a competent developer, deployable as a static SPA (no backend needed for v1), and usable by 6-7 year olds on tablets.

## 0. Technology Decisions (Pragmatic, Not Academic)

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | React 18 + TypeScript | You asked for it; ecosystem is unmatched for interactive UIs |
| Build tool | Vite | Sub-second HMR, zero config |
| Drag & Drop | @dnd-kit/core | Purpose-built for React, accessible, touch-first, better than react-dnd for kids' fat-finger targets |
| Animation | Framer Motion | Declarative layout animations for the "split tree" and "snap to 10-frame" transitions |
| Styling | Tailwind CSS + CSS Modules (for custom grid/shape components) | Speed + precision where needed |
| Sound | Howler.js | Kids need audio feedback — pops, chimes, celebratory sounds |
| Persistence | localStorage (v1), upgradable to Supabase | No auth needed for exam review; parent opens on family tablet |
| Deployment | Vercel or Netlify | One git push, done |
| i18n (Arabic) | Built-in from Day 0 — RTL layout, Arabic numerals toggle | This is Egypt. The UI chrome must be Arabic. Math symbols are universal. |

## 1. Database Schema (TypeScript Interfaces)
No server for v1. Everything lives in a typed store persisted to localStorage.

```typescript
// ============================================
// CURRICULUM CONTENT (Static, shipped with app)
// ============================================

interface Chapter {
  id: string;                    // "ch10" | "ch11" | ... | "ch17"
  titleAr: string;               // "أشكال مختلفة"
  titleEn: string;               // "Different Shapes"
  icon: string;                  // emoji or SVG id
  color: string;                 // chapter theme color (hex)
  lessons: Lesson[];
  unlockAfter?: string;          // chapter id prerequisite (null = always open)
}

interface Lesson {
  id: string;                    // "ch10-L1", "ch12-L2"
  titleAr: string;
  titleEn: string;
  conceptKey: ConceptKey;        // discriminated union key
  activities: Activity[];
}

// The core discriminated union — each concept drives a different
// interactive component
type ConceptKey =
  | "shape-3d-identify"          // Ch10: identify 3D shapes
  | "shape-3d-to-2d"            // Ch10: trace 3D → 2D footprint
  | "compare-capacity"           // Ch11: which holds more (cups)
  | "compare-area"               // Ch11: count grid squares
  | "addition-make-10"           // Ch12: split tree addition
  | "subtraction-use-10"         // Ch13: split tree subtraction
  | "place-value-group"          // Ch14: group ones into tens
  | "place-value-hundreds-chart" // Ch14: navigate 1-100 grid
  | "place-value-number-line"    // Ch14: jump on number line
  | "compose-shapes"             // Ch15: combine 2D shapes
  | "tell-time"                  // Ch16: read analog clock
  | "add-sub-mixed"              // Ch17: mixed operations word problems

interface Activity {
  id: string;
  type: "interactive" | "quiz" | "drag-drop" | "coloring";
  conceptKey: ConceptKey;
  difficulty: 1 | 2 | 3;        // scaffolded within each lesson
  data: ActivityData;            // polymorphic payload (see below)
}

// Polymorphic activity payloads
type ActivityData =
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
  | MixedWordProblemData;

// === Example payload types ===

interface Make10Data {
  type: "addition-make-10";
  addendA: number;              // e.g., 9
  addendB: number;              // e.g., 4
  splitFrom: "A" | "B";        // which number gets split (always smaller)
  splitParts: [number, number]; // [1, 3] — the correct split
  targetSum: number;            // 13
  tenFrameInitial: number;     // pre-filled dots in the 10-frame (9)
}

interface Use10SubtractData {
  type: "subtraction-use-10";
  minuend: number;              // e.g., 14
  subtrahend: number;           // e.g., 6
  splitParts: [number, number]; // [4, 2] — split subtrahend
  intermediateResult: 10;       // always 10
  finalResult: number;          // 8
}

interface AreaGridData {
  type: "compare-area";
  gridRows: number;
  gridCols: number;
  shapeA: GridCell[];           // pre-colored cells for shape A
  shapeB: GridCell[];           // pre-colored cells for shape B
  question: "which-larger" | "how-many-more";
  correctAnswer: number;
}

interface GridCell {
  row: number;
  col: number;
}

interface CapacityData {
  type: "compare-capacity";
  containers: {
    label: string;              // "الإناء أ" 
    imageId: string;
    capacityCups: number;       // e.g., 5
  }[];
  question: "order" | "difference" | "which-more";
  correctAnswer: number | number[]; // depends on question type
}

interface HundredsChartData {
  type: "place-value-hundreds-chart";
  highlightedCells: number[];   // pre-highlighted numbers
  missingCells: number[];       // cells student must fill in
  question: "fill-missing" | "find-pattern" | "jump-by-10";
}

interface TellTimeData {
  type: "tell-time";
  hourHandAngle: number;        // degrees
  minuteHandAngle: number;      // degrees (only 0, 90, 180, 270 for half/quarter)
  correctHour: number;
  correctMinuteLabel: "o-clock" | "half-past";
}

interface Shape3Dto2DData {
  type: "shape-3d-to-2d";
  shape3d: "cube" | "cylinder" | "sphere" | "prism" | "cuboid";
  correctFootprint: "square" | "circle" | "triangle" | "rectangle";
  distractors: string[];        // wrong 2D shapes to show
}

interface PlaceValueData {
  type: "place-value-group";
  totalItems: number;           // e.g., 34 loose items
  expectedTens: number;         // 3
  expectedOnes: number;         // 4
  visualType: "blocks" | "sticks" | "stars";
}

interface NumberLineData {
  type: "place-value-number-line";
  rangeStart: number;
  rangeEnd: number;
  markedPoints: number[];       // points already labeled
  missingPoints: number[];      // student fills these in
  jumpSize: 1 | 2 | 5 | 10;
}

interface ComposeShapesData {
  type: "compose-shapes";
  targetShape: string;          // SVG path or shape name
  availablePieces: ShapePiece[];
  correctCombination: string[]; // piece ids
}

interface ShapePiece {
  id: string;
  shape: "triangle" | "square" | "rectangle" | "semicircle";
  rotation: number;
}

interface MixedWordProblemData {
  type: "add-sub-mixed";
  storyAr: string;              // Arabic word problem
  storyEn: string;
  operation: "+" | "-";
  operands: [number, number];
  correctAnswer: number;
  imageId: string;              // illustration for the story
}


// ============================================
// STUDENT PROGRESS (Persisted to localStorage)
// ============================================

interface StudentProfile {
  id: string;                   // uuid
  name: string;
  avatarId: string;
  createdAt: string;            // ISO date
  lastActiveAt: string;
}

interface ProgressStore {
  student: StudentProfile;
  chapterProgress: Record<string, ChapterProgress>;
  totalStars: number;
  streakDays: number;
  lastSessionDate: string;
}

interface ChapterProgress {
  chapterId: string;
  status: "locked" | "available" | "in-progress" | "completed";
  lessonsProgress: Record<string, LessonProgress>;
  bestScore: number;            // 0-100
  starsEarned: 0 | 1 | 2 | 3;
}

interface LessonProgress {
  lessonId: string;
  status: "not-started" | "in-progress" | "completed";
  activitiesCompleted: string[];  // activity ids
  attempts: AttemptRecord[];
  bestScore: number;
}

interface AttemptRecord {
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
```

## Persistence Layer (Thin Abstraction)

```typescript
// src/lib/storage.ts
const STORAGE_KEY = "mathapp_progress";

export const storage = {
  load(): ProgressStore | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  
  save(store: ProgressStore): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },
  
  // Future: swap this for Supabase client
  // load: () => supabase.from('progress').select('*').single(),
  // save: (s) => supabase.from('progress').upsert(s),
};
```
## 2. React Component Architecture

### Component Tree (Top-Down)

```text
<App>
├── <AppProvider>                      // React Context: progress, settings, audio
│   ├── <Router>
│   │   ├── <SplashScreen />           // "مرحباً!" + avatar picker
│   │   ├── <ChapterMap />             // Main hub — visual chapter selector
│   │   │   └── <ChapterNode />×8     // Circular icons, locked/unlocked states
│   │   │
│   │   ├── <LessonScreen />           // Entered from ChapterMap
│   │   │   ├── <LessonHeader />       // Progress bar, stars, back button
│   │   │   ├── <ActivityCarousel />   // Swipeable activity cards
│   │   │   │   └── <ActivityRenderer conceptKey={...} data={...} />
│   │   │   │       // ↑ This is the CORE SWITCH — renders the right interactive
│   │   │   │       // component based on conceptKey discriminant
│   │   │   │
│   │   │   └── <LessonComplete />     // Stars animation, "next" button
│   │   │
│   │   └── <ParentDashboard />        // Simple stats view (pin-protected)
│   │
│   └── <AudioManager />               // Global sound effect controller
│       └── <BackgroundMusic />
```

### The Core Switch: `<ActivityRenderer />`

- This is the most important component. It pattern-matches on conceptKey:

```typescript
// src/components/ActivityRenderer.tsx
import { Activity } from "../types/curriculum";

export function ActivityRenderer({ 
  activity, 
  onComplete 
}: { 
  activity: Activity; 
  onComplete: (result: ActivityResult) => void;
}) {
  switch (activity.conceptKey) {
    case "shape-3d-identify":
      return <ShapeIdentifier data={activity.data} onComplete={onComplete} />;
    case "shape-3d-to-2d":
      return <ShapeFootprint data={activity.data} onComplete={onComplete} />;
    case "compare-capacity":
      return <CapacityPourer data={activity.data} onComplete={onComplete} />;
    case "compare-area":
      return <AreaGrid data={activity.data} onComplete={onComplete} />;
    case "addition-make-10":
      return <SplitTreeAdder data={activity.data} onComplete={onComplete} />;
    case "subtraction-use-10":
      return <SplitTreeSubtractor data={activity.data} onComplete={onComplete} />;
    case "place-value-group":
      return <BlockGrouper data={activity.data} onComplete={onComplete} />;
    case "place-value-hundreds-chart":
      return <HundredsChart data={activity.data} onComplete={onComplete} />;
    case "place-value-number-line":
      return <NumberLine data={activity.data} onComplete={onComplete} />;
    case "compose-shapes":
      return <ShapeComposer data={activity.data} onComplete={onComplete} />;
    case "tell-time":
      return <ClockFace data={activity.data} onComplete={onComplete} />;
    case "add-sub-mixed":
      return <WordProblem data={activity.data} onComplete={onComplete} />;
  }
}
```

### Interactive Component Catalog (The 12 Widgets)

- Each of these is a self-contained interactive component. Here's the design spec for each:

```text
src/components/interactives/
├── ShapeIdentifier.tsx        # Ch10 — Tap the correct 3D shape from a lineup
├── ShapeFootprint.tsx         # Ch10 — Drag 3D shape onto "ink pad", reveal 2D outline
├── CapacityPourer.tsx         # Ch11 — Animated pour: drag cup to fill container
├── AreaGrid.tsx               # Ch11 — Tap grid cells to color, counter shows area
├── SplitTreeAdder.tsx         # Ch12 — THE KEY WIDGET (detailed below)
├── SplitTreeSubtractor.tsx    # Ch13 — Reverse split tree
├── BlockGrouper.tsx           # Ch14 — Drag loose blocks into groups of 10
├── HundredsChart.tsx          # Ch14 — Interactive 10×10 grid, highlight patterns
├── NumberLine.tsx             # Ch14 — Draggable frog/kangaroo jumps on line
├── ShapeComposer.tsx          # Ch15 — Tangram-like: drag shapes to fill outline
├── ClockFace.tsx              # Ch16 — Draggable clock hands, or tap correct time
└── WordProblem.tsx            # Ch17 — Illustrated story + number input
```

## 3. The Crown Jewel: <SplitTreeAdder /> — Detailed State Machine Design

- This is the most pedagogically critical and technically complex component. It deserves a full state machine design.

### Visual Layout

```text
┌──────────────────────────────────────┐
│                                      │
│     [ 9 ]  +  [ 4 ]  =  [   ]        │  ← Problem row
│                  │                   │
│              ┌───┴───┐               │  ← Split tree (appears on step 2)
│             [1]     [3]              │
│              │                       │
│     [ 9 ]+[1]= [10]                  │  ← Merge animation (step 3)
│                                      │
│     ┌──────────────────────┐         │
│     │ ● ● ● ● ●  ● ● ● ● ○ │         │  ← Ten-frame (9 filled, 1 empty)
│     │ ○ ○ ○ ○ ○  ○ ○ ○ ○ ○ │         │
│     └──────────────────────┘         │
│                                      │
│     [10] + [3] = [ 13 ] ✅          │  ← Final equation (step 4)
│                                      │
└──────────────────────────────────────┘
```

### State Machine (useReducer)

```typescript
type SplitTreeState = {
  phase: 
    | "show-problem"           // Display 9 + 4 = ?
    | "choose-split"           // Child taps the number to split (4)
    | "drag-split"             // Split tree appears, child drags parts
    | "make-10"                // 1 flies to 9, ten-frame fills, "10!" pops
    | "final-add"              // 10 + 3 = ?, child enters answer
    | "celebrate"              // Confetti, star, sound
    | "retry";                 // Gentle "try again" nudge

  addendA: number;
  addendB: number;
  splitParts: [number, number] | null;
  userSplitA: number | null;   // what the child entered for split part 1
  userSplitB: number | null;
  tenFrameFilled: number;      // animated counter 0→9→10
  finalAnswer: number | null;
  mistakes: number;
};

type SplitTreeAction =
  | { type: "SELECT_SPLIT_NUMBER"; which: "A" | "B" }
  | { type: "SUBMIT_SPLIT"; parts: [number, number] }
  | { type: "DRAG_TO_TEN_FRAME" }
  | { type: "SUBMIT_FINAL_ANSWER"; answer: number }
  | { type: "RETRY" }
  | { type: "NEXT" };
```

### Interaction Flow (Step by Step)

- Phase: show-problem — Screen shows 9 + 4 = ? with large colorful numbers. Ten-frame shows 9 red dots. Voice says "تسعة زائد أربعة" (9 plus 4).
- Phase: choose-split — Prompt: "أي رقم نقسمه؟" (Which number do we split?). Child taps 4. If they tap 9, gentle nudge: "Let's split the smaller one!"
- Phase: drag-split — The 4 "opens" into a tree. Two empty circles appear below. Child drags number tiles (or taps +/- buttons) to fill in 1 and 3. Validation: parts must sum to 4.
- Phase: make-10 — The "1" animates flying to the 9. Ten-frame's 10th dot fills in with a satisfying "pop". Big "١٠!" (10!) appears.
Phase: final-add — New equation: 10 + 3 = ?. Child taps a number pad or drags to answer. Ten-frame now shows 10 filled + 3 extra below.
Phase: celebrate — Confetti, star earned, "!أحسنت" (Well done!).

## 4. State Management Architecture
Three Layers
```
Layer 1: App Context (Global)
├── StudentProfile
├── ProgressStore (persisted)
├── Settings (language, sound on/off)
└── AudioController

Layer 2: Lesson Context (Per-lesson session)
├── currentActivityIndex
├── activitiesResults[]
├── sessionStartTime
└── lessonScore (rolling)

Layer 3: Activity Local State (Per-widget, useReducer)
├── SplitTreeState (shown above)
├── AreaGridState { coloredCells: Set<string>, selectedColor: string }
├── ClockFaceState { hourAngle: number, minuteAngle: number, isDragging: boolean }
└── etc.
```
### Implementation
```typescript
// src/context/AppContext.tsx
interface AppContextValue {
  progress: ProgressStore;
  dispatch: React.Dispatch<ProgressAction>;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  audio: {
    playEffect: (name: SoundEffect) => void;
    toggleMusic: () => void;
  };
}

type ProgressAction =
  | { type: "COMPLETE_ACTIVITY"; chapterId: string; lessonId: string; activityId: string; result: ActivityResult }
  | { type: "COMPLETE_LESSON"; chapterId: string; lessonId: string; score: number }
  | { type: "UNLOCK_CHAPTER"; chapterId: string }
  | { type: "ADD_STARS"; count: number }
  | { type: "RESET_PROGRESS" };

// Reducer auto-saves to localStorage on every dispatch
function progressReducer(state: ProgressStore, action: ProgressAction): ProgressStore {
  let next: ProgressStore;
  switch (action.type) {
    case "COMPLETE_ACTIVITY": { /* update nested progress */ }
    case "COMPLETE_LESSON": { /* calculate stars, check unlock next chapter */ }
    // ...
  }
  storage.save(next);
  return next;
}
```

## 5. Content Data Pipeline
- The curriculum content should live as static JSON files shipped with the app, not fetched from an API:
```
src/data/
├── chapters.json              // Chapter metadata (titles, colors, icons, order)
├── ch10-shapes.json           // All activities for Chapter 10
├── ch11-compare.json
├── ch12-addition-make10.json
├── ch13-subtraction-use10.json
├── ch14-place-value.json
├── ch15-compose-shapes.json
├── ch16-time.json
├── ch17-mixed.json
└── assets-manifest.json       // Maps imageId → actual asset paths
```
### Activity Generation Strategy
For the exam review use case, that needs volume — lots of practice problems:

- Hand-author 3-5 "template" activities per concept from the textbook's exact exercises.
- Write a generator function that creates randomized variants:
```typescript
// src/lib/generators/make10Generator.ts
export function generateMake10Problem(difficulty: 1 | 2 | 3): Make10Data {
  // Difficulty 1: addendA is always 9 (only need to find 1 to make 10)
  // Difficulty 2: addendA is 7 or 8
  // Difficulty 3: addendA is 5 or 6 (larger splits)
  
  const addendA = difficulty === 1 ? 9 
    : difficulty === 2 ? pick([7, 8]) 
    : pick([5, 6]);
  
  const addendB = randomInt(2, 10 - addendA + 4); // ensure sum ≤ 18
  const splitGive = 10 - addendA;
  const splitKeep = addendB - splitGive;
  
  return {
    type: "addition-make-10",
    addendA,
    addendB,
    splitFrom: "B",
    splitParts: [splitGive, splitKeep],
    targetSum: addendA + addendB,
    tenFrameInitial: addendA,
  };
}
```
- This gives infinite practice problems that still follow the exact Egyptian pedagogical method.

## 6. Asset Requirements
```
public/assets/
├── shapes/
│   ├── 3d/  (cube.svg, cylinder.svg, sphere.svg, prism.svg, cuboid.svg)
│   └── 2d/  (square.svg, circle.svg, triangle.svg, rectangle.svg)
├── characters/
│   ├── mascot-happy.svg
│   ├── mascot-thinking.svg
│   └── mascot-celebrate.svg
├── sounds/
│   ├── pop.mp3, ding.mp3, whoosh.mp3
│   ├── correct.mp3, try-again.mp3
│   ├── stars-earned.mp3
│   └── bg-music.mp3
├── ten-frame/
│   ├── dot-red.svg, dot-blue.svg
│   └── frame-empty.svg
└── ui/
    ├── star-empty.svg, star-filled.svg
    └── lock.svg
```
- For speed, use simple geometric SVGs (inline or from a sprite). Don't waste time on fancy illustrations — clean, colorful shapes are pedagogically superior for 7-year-olds anyway.

## 7. Step-by-Step Build Roadmap

### Day 1 (The Sprint)

| Hour | Task | Output |
|---|---|---|
| 0-1 | Scaffold — npm create vite@latest math-review -- --template react-ts, install deps (@dnd-kit/core, @dnd-kit/sortable, framer-motion, howler, tailwindcss) | Boilerplate running |
| 1-2 | Data layer — Write all TypeScript interfaces, create chapters.json and the 8 chapter data files. Write the storage.ts persistence layer and AppContext. | Types + static data |
| 2-3 | Shell UI — <App>, routing (react-router or simple state-based), <ChapterMap> with 8 clickable chapter nodes, <LessonScreen> with <ActivityCarousel> skeleton | Navigate chapters → lessons |
| 3-5 | Build SplitTreeAdder (the hardest widget) — Full state machine, ten-frame visual, drag-and-drop split, animations | Chapter 12 playable |
| 5-6 | Build SplitTreeSubtractor — Clone of Adder with reversed logic | Chapter 13 playable |
| 6-7 | Build AreaGrid + CapacityPourer — Grid click-to-color with counter, animated pouring | Chapter 11 playable |
| 7-8 | Build HundredsChart + NumberLine + BlockGrouper | Chapter 14 playable |
| 8-9 | Build ShapeFootprint + ShapeIdentifier | Chapter 10 playable |
| 9-10 | Build ClockFace + ShapeComposer + WordProblem | Chapters 15-17 playable |
| 10-11 | Progress tracking — Wire up the progressReducer, star animations on lesson complete, chapter unlock logic | Full loop working |
| 11-12 | Polish — Arabic strings, RTL layout pass, sound effects, touch target sizing (min 48×48px), deploy to Vercel | Ship it |

### Post-Day-1 Enhancements (If Time Allows Before Exams)

- Adaptive difficulty: Track error rate per concept, auto-adjust difficulty level
- Spaced repetition: Resurface concepts the child struggled with
- Parent report: PIN-protected dashboard showing time spent, weak areas
- Playlist integration: Embed relevant YouTube videos as "hint" buttons per chapter
- Print mode: Generate PDF practice sheets from the same data (for offline review)

## 8. Critical UX Rules for 7-Year-Olds
- Hardcode these into component library:

```typescript
// src/lib/ux-constants.ts
export const UX = {
  // Touch targets
  MIN_TAP_SIZE: 56,          // px — Apple says 44, but fat little fingers need more
  DRAG_HANDLE_SIZE: 64,      // px
  
  // Timing
  ANIMATION_DURATION: 400,    // ms — slow enough to follow, fast enough not to bore
  CELEBRATION_DELAY: 1500,    // ms — let them enjoy the confetti
  AUTO_ADVANCE_DELAY: 2000,   // ms — after celebration, auto-move to next
  
  // Forgiveness
  MAX_RETRIES_BEFORE_HINT: 2, // after 2 wrong attempts, show a visual hint
  HINT_STYLE: "highlight",    // highlight the correct zone, don't give the answer
  
  // Audio
  PLAY_VOICE_PROMPT: true,    // read the question aloud in Arabic
  CORRECT_SOUND: "ding",
  WRONG_SOUND: "gentle-buzz", // NOT harsh — never punish
  
  // Colors (high contrast, colorblind-safe)
  PRIMARY: "#4CAF50",         // green — correct/go
  SECONDARY: "#2196F3",       // blue — interactive elements
  ACCENT: "#FF9800",          // orange — highlights
  DANGER: "#F44336",          // red — ONLY for "X" marks, never for backgrounds
};
```

## 9. Key Architectural Decision: Why No Backend
For a 2-week exam review sprint:

- No auth — Parent bookmarks the page. Progress is device-local.
- No database — localStorage is instant, offline-capable, zero ops.
- No API — All content is static JSON bundled in the build.
- Offline-capable — Add a service worker (Vite PWA plugin) and it works without internet on the family tablet.

If you later want multi-device sync or classroom analytics, swap storage.ts for Supabase in 30 minutes.

**Total 12 interactive components** that need to be built. Starting with SplitTreeAdder.tsx — write the complete, production-ready React component with @dnd-kit drag-and-drop, framer-motion animations, and the useReducer state machine Opus specified. Use the exact TypeScript interfaces from the schema."

Then work component-by-component through the catalog. Each widget is self-contained.
