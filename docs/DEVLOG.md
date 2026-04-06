# DEVLOG (2026-04-05)

## Phase 0: Data & Plan

### Task-1: (x)
- Notebook created with Book 2 and 3 `local-files\Math-Grade-Primary-01-184-252.pdf` `local-files\Math-Grade-Primary-01-253-288.pdf`

### Task-2: (x)
- Intial BLUEPRINT.md nad local git

### Task-3: (x)

- Flash to create data/ directory
    - Extract Chapter 10 (Sheets 1-2 + Assessment) -> data/chapter_10.json
    - Extract Chapter 11 (Sheets 3-6 + Assessments) -> data/chapter_11.json
    - Extract Chapter 12 (Sheet 7 + Assessment) -> data/chapter_12.json
    - Extract Chapter 13 (Sheet 8 + Assessments) -> data/chapter_13.json
    - Final verification pass against Answer Guide
**Output:**
- Data Structure
The data is stored in the data/ directory as JSON files, using abstract descriptors for visual assets:
imageType: General category (e.g., cylinder, sphere).
context: Specific object for rendering (e.g., gift-box, tennis-ball).
equation / steps: Logic-based fields for conceptual math strategies.

- JSON Files Created
data/chapter_10.json
data/chapter_11.json
data/chapter_12.json
data/chapter_13.json
data/chapter_14.json

---

## Phase 1: Scaffold

### Task-1: (x)
- Scaffold a Vite + React 18 + TypeScript project. 
- Install: @dnd-kit/core, @dnd-kit/sortable, framer-motion, howler, tailwindcss.
- Create the directory structure from the blueprint.
- Create src/data/book-terms.ts with the exact vocabulary constants.
- Create src/types/curriculum.ts with all TypeScript interfaces.
- Create src/context/AppContext.tsx with the progress reducer.
- Create src/lib/storage.ts for localStorage persistence.
- Create placeholder JSON files in src/data/ for chapters 10-17.
- Wire up basic routing: SplashScreen → ChapterMap → LessonScreen.

**Output:**
- Scaffolding: Vite 8 + React 19 + TypeScript 6 + Tailwind v4  (all current versions)

#### Project structure:
```
src/                                                                      
├── App.tsx                     # Router: / → /chapters → /lesson/:id              
├── main.tsx + index.css        # Entry point + Tailwind import                  
├── context/AppContext.tsx       # Progress reducer, settings, audio stubs
├── lib/storage.ts              # localStorage persistence
├── types/curriculum.ts         # All interfaces from blueprint
├── data/
├── book-terms.ts           # Exact textbook vocabulary
│   └── chapters.ts             # 8 chapter stubs (lessons empty — data is changing)
├── screens/
│   ├── SplashScreen.tsx        # "اًبحرم!" → chapters
│   ├── ChapterMap.tsx          # 2×4 grid, lock/unlock, stars
│   └── LessonScreen.tsx        # Per-chapter lesson list (placeholder)
└── components/interactives/    # Empty — ready for the 12 widgets
```
- TypeScript compiles clean, Vite builds in <500ms. Ready for git add + commit

### Task 2: (x) 12&13 uploaded -- #TODO --> the rest of Book 1
Create Book 1 notebook. Upload only Ch12+13 splits first (highest exam weight). It becomes the oracle you query during dev if a terminology question comes up.

---

## Next actions:

| Priority | Component | Why First
|---|---|---
| 1 | GuidedBoxFill | Covers Ch12 + Ch13, mirrors exact exam format, most questions in the book
| 2 | SplitTreeAdder (learn mode) | The conceptual teaching tool that feeds into GuidedBoxFill
| 3 | HundredsChart | Ch14 is the largest chapter (9 lessons), high exam weight
| 4 | BlockGrouper + NumberLine | Rest of Ch14 place value
| 5 | AreaGrid + CapacityPourer | Ch11, reusable for Art Corner
| 6 | ShapeFootprint + ShapeIdentifier | Ch10, straightforward
| 7	| ClockFace	|Ch16, self-contained
| 8	| ShapeComposer	|Ch15, tangram-style, fun but lower exam weight
| 9 | WordProblem	|   Ch17, text + number input, simple component
| 10 | ArtCorner	|   Reward layer, reuses AreaGrid internals

- Static JSON = the exact textbook problems (faithful to what kids will see on the exam)
- Generators = infinite practice variants (for when they've exhausted the book problems)

## Phase 2: Implementation

**Three reasons** to start with GuidedBoxFill over SplitTreeAdder:

- It covers both Ch12 and Ch13 (addition AND subtraction)
- It matches the exact exam format — sequential boxes, not animated trees
- It's simpler to build — no drag-and-drop, no physics, just step-through validation

SplitTreeAdder (learn mode) comes second and can even be optional if time gets tight. A kid who drills Style B boxes will pass the exam. A kid who only plays with animated trees might not.

---

### Component #1: GuidedBoxFill

- What It Does? Renders the exact textbook exercise format:
```
Let's calculate 5 + 8

Step 1:  5 needs [___] more to make 10.
Step 2:  Split 8 into [___] and 3
Step 3:  Add [___] to 5 to make 10.
Step 4:  10 and [___] make [___]
```

- Child fills boxes one at a time. Each correct answer locks and reveals the next step. Works for both addition (Ch12) and subtraction (Ch13) by swapping the step templates.

#### Props Interface

```typescript
// src/components/interactives/GuidedBoxFill.tsx

interface GuidedBoxFillProps {
  data: GuidedBoxProblem;
  onComplete: (result: ActivityResult) => void;
}

interface GuidedBoxProblem {
  type: "addition" | "subtraction";
  equation: string;            // "5 + 8" or "14 - 6" — displayed at top
  steps: GuidedStep[];
  finalAnswer: number;
}

interface GuidedStep {
  id: string;
  template: string;            // "5 needs {0} more to make 10."
  blanks: BlankSlot[];         // one or more blanks per step
  revealAfterPrevious: boolean;// true for steps 2+ (progressive disclosure)
}

interface BlankSlot {
  index: number;               // position in template ({0}, {1})
  correctValue: number;
  hint?: string;               // shown after 2 wrong attempts
}

interface ActivityResult {
  correct: boolean;
  attempts: number;
  timeMs: number;
  mistakesPerStep: Record<string, number>;
}
```

#### Sample Data (Hardcoded for Development)

```typescript
// src/data/samples/make10-samples.ts

export const SAMPLE_ADD_5_8: GuidedBoxProblem = {
  type: "addition",
  equation: "5 + 8",
  steps: [
    {
      id: "s1",
      template: "5 needs {0} more to make 10.",
      blanks: [{ index: 0, correctValue: 5, hint: "What plus 5 equals 10?" }],
      revealAfterPrevious: false,
    },
    {
      id: "s2",
      template: "Split 8 into {0} and {1}",
      blanks: [
        { index: 0, correctValue: 5 },
        { index: 1, correctValue: 3 },
      ],
      revealAfterPrevious: true,
    },
    {
      id: "s3",
      template: "Add {0} to 5 to make 10.",
      blanks: [{ index: 0, correctValue: 5 }],
      revealAfterPrevious: true,
    },
    {
      id: "s4",
      template: "10 and {0} make {1}",
      blanks: [
        { index: 0, correctValue: 3 },
        { index: 1, correctValue: 13 },
      ],
      revealAfterPrevious: true,
    },
  ],
  finalAnswer: 13,
};

export const SAMPLE_SUB_14_6: GuidedBoxProblem = {
  type: "subtraction",
  equation: "14 - 6",
  steps: [
    {
      id: "s1",
      template: "14 needs to go down to 10. Split 6 into {0} and {1}.",
      blanks: [
        { index: 0, correctValue: 4, hint: "14 minus what equals 10?" },
        { index: 1, correctValue: 2 },
      ],
      revealAfterPrevious: false,
    },
    {
      id: "s2",
      template: "14 - {0} = 10",
      blanks: [{ index: 0, correctValue: 4 }],
      revealAfterPrevious: true,
    },
    {
      id: "s3",
      template: "10 - {0} = {1}",
      blanks: [
        { index: 0, correctValue: 2 },
        { index: 1, correctValue: 8 },
      ],
      revealAfterPrevious: true,
    },
  ],
  finalAnswer: 8,
};
```
#### State Machine
```typescript
// Inside GuidedBoxFill.tsx

interface BoxFillState {
  currentStepIndex: number;
  filledValues: Record<string, Record<number, number | null>>;
  // e.g., { "s1": { 0: 5 }, "s2": { 0: null, 1: null } }
  stepStatus: Record<string, "locked" | "active" | "correct" | "wrong">;
  attemptsPerStep: Record<string, number>;
  showHint: Record<string, boolean>;
  phase: "working" | "all-correct" | "celebrate";
  startTime: number;
}

type BoxFillAction =
  | { type: "SUBMIT_BLANK"; stepId: string; blankIndex: number; value: number }
  | { type: "CLEAR_WRONG" }
  | { type: "ADVANCE_STEP" }
  | { type: "CELEBRATE" };
```

#### Interaction Flow

```text
┌─────────────────────────────────────────┐
│         Let's calculate 5 + 8           │  ← Big, bold equation
│─────────────────────────────────────────│
│                                         │
│  ✅ 5 needs [5] more to make 10.        │  ← Completed, green bg
│                                         │
│  → Split 8 into [___] and [___]         │  ← Active step, pulsing border
│                                         │
│  ░ Add ___ to 5 to make 10.             │  ← Locked, dimmed
│  ░ 10 and ___ make ___                  │  ← Locked, dimmed
│                                         │
│─────────────────────────────────────────│
│                                         │
│  ┌───┬───┬───┬───┬───┐                  │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │                  │  ← Large number pad
│  ├───┼───┼───┼───┼───┤                  │
│  │ 6 │ 7 │ 8 │ 9 │ ⌫ │                 │   (touch-friendly,
│  │ 6 │ 7 │ 8 │ 9 │ ⌫ │                 │      56px minimum)
│  └───┴───┴───┴───┴───┘                  │
│           [ ✓ Check ]                   │  ← Submit current blank
│                                         │
└─────────────────────────────────────────┘
```

**Step-by-step user journey:**

- Screen shows equation + Step 1 active + Steps 2-4 locked (dimmed, no text visible yet)
- Child taps 5 on number pad → taps Check → correct → ding sound → step turns green, value locks
- Step 2 slides in (Framer Motion layout animation), two blanks pulse
- First blank is auto-focused. Child taps 5 → Check → correct → first blank locks, cursor moves to second blank
- Child taps 3 → Check → correct → whole step turns green
- Steps 3 and 4 follow same pattern
- All steps green → 500ms pause → confetti + "Well done!" + star animation → onComplete fires

**On wrong answer:**

- Blank flashes red briefly (200ms), gentle buzz sound
- attemptsPerStep[stepId]++
- After 2 wrong attempts on same blank: hint text fades in below the step
- Value clears, child tries again
- Never blocks, never punishes, never shows the answer

#### Number Pad Design Rules

```typescript
// The number pad should be CONTEXTUAL — only show numbers
// that could plausibly be correct, to reduce cognitive load
// for 7-year-olds while still requiring thought.

function getNumberPadRange(problem: GuidedBoxProblem): number[] {
  // For addition making-10: numbers 0-10 are sufficient
  // For subtraction using-10: numbers 0-18 at most
  if (problem.type === "addition") return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (problem.type === "subtraction") return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}

// For Step 4's second blank (the final answer, e.g., 13),
// extend to include teen numbers: 11-18
// Detect this by checking if blank.correctValue > 10
```

#### Generator Function

```typescript
// src/lib/generators/guidedBoxGenerator.ts

export function generateMake10Addition(
  addendA: number,
  addendB: number,
  splitTarget: "A" | "B" = "B"
): GuidedBoxProblem {
  const target = splitTarget === "B" ? addendB : addendA;
  const other = splitTarget === "B" ? addendA : addendB;
  const give = 10 - other;
  const keep = target - give;
  const sum = addendA + addendB;

  return {
    type: "addition",
    equation: `${addendA} + ${addendB}`,
    steps: [
      {
        id: "s1",
        template: `${other} needs {0} more to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: false,
      },
      {
        id: "s2",
        template: `Split ${target} into {0} and {1}`,
        blanks: [
          { index: 0, correctValue: give },
          { index: 1, correctValue: keep },
        ],
        revealAfterPrevious: true,
      },
      {
        id: "s3",
        template: `Add {0} to ${other} to make 10.`,
        blanks: [{ index: 0, correctValue: give }],
        revealAfterPrevious: true,
      },
      {
        id: "s4",
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
}

// Generate all valid Making-10 problems for drilling
export function generateAllMake10Problems(): GuidedBoxProblem[] {
  const problems: GuidedBoxProblem[] = [];
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a + b > 10 && a + b <= 18) {
        // Split the smaller number (book's "First Way")
        if (b <= a) problems.push(generateMake10Addition(a, b, "B"));
        else problems.push(generateMake10Addition(a, b, "A"));
      }
    }
  }
  return problems; // ~30 unique problems
}
```

#### Build Instructions

- Build `src/components/interactives/GuidedBoxFill.tsx`

Requirements:
- React 19 functional component with useReducer
- Props: GuidedBoxFillProps (defined in src/types/curriculum.ts)
- Framer Motion for step reveal animations (AnimatePresence + layout)
- Large touch targets: number pad buttons minimum 56px
- Color scheme: active step has blue-500 border, correct step has 
  green-100 bg with green-600 text, locked steps are gray-200 with 
  no visible text content
- Number pad: 2 rows of 5, numbers 1-9 plus backspace
- When a blank's correctValue > 10, render a second row: 10-18
- Sound hooks: call audio.playEffect("correct") and 
  audio.playEffect("tryAgain") from AppContext
- After all steps complete, 500ms delay then call onComplete
- Include the generator function in src/lib/generators/guidedBoxGenerator.ts
- Create src/data/samples/make10-samples.ts with the 2 sample problems
- Add a temporary dev route "/dev/guidedbox" that renders the component
  with sample data so we can test immediately

---

### Status Update: [2026-04-06]
#### Component #1: GuidedBoxFill — COMPLETED ✅

**What was built:**

- **Types** — `GuidedBoxProblem`, `GuidedStep`, `BlankSlot` added to `src/types/curriculum.ts`
- **Sample data** — `src/data/samples/make10-samples.ts` with the 5+8 addition and 14-6 subtraction examples from the DEVLOG
- **Generator** — `src/lib/generators/guidedBoxGenerator.ts` with:
  - `generateMake10Addition()` — any a+b pair
  - `generateUse10Subtraction()` — any minuend-subtrahend pair
  - `generateAllMake10Problems()` / `generateAllUse10Problems()` — exhaustive sets
- **Component** — `src/components/interactives/GuidedBoxFill.tsx`:
  - `useReducer` state machine with phases: `working` → `all-correct` → `celebrate`
  - Progressive step reveal with Framer Motion `AnimatePresence` + `layout`
  - 56px+ touch targets on number pad (1-9, backspace, conditional teen row 10-18)
  - Wrong answer: red shake animation, hint after 2 failures
  - Correct answer: green lock, auto-advance to next blank/step
  - Sound hooks via `useApp().audio`
  - Fires `onComplete` with score/attempts/time after celebration
- **Dev route** — `/dev/guidedbox` with problem picker and reset button

**System Health:**
- TypeScript clean, Vite builds in 2s. 
- **Test:** Run `npm run dev` and navigate to `/dev/guidedbox`.

---

### JSON — Quick Integration Note

- Before Component #2
```
Read the 5 JSON files created in data/chapter_10.json through 
data/chapter_14.json. Compare their shape to our GuidedBoxProblem 
interface in src/types/curriculum.ts. 

Create src/lib/adapters/flashDataAdapter.ts that maps the files format into app's types. Don't refactor JSON files — write a thin translation layer. Log any fields that don't map cleanly to a 
FLASH_DATA_GAPS.md file so we know what to fix later.
```

**Output:**
- Adapter — src/lib/adapters/flashDataAdapter.ts maps 10 Flash problem types:
  - Fully mapped (6): multiple-choice-visual, visual-selection, matching, unit-counting, split-tree-addition, split-tree-subtraction, fill-in-the-blanks, ten-grouping place-value-counting
  - Skipped (5): counting-composite, ordering, area-comparison-visual, word-problem, result-finding
  Key findings in `FLASH_DATA_GAPS.md`

---

### Component #2: `SplitTreeAdder` (Learn Mode)

- Why This Exists Alongside GuidedBoxFill
GuidedBoxFill is the exam trainer — sequential boxes, text-heavy, mirrors the test paper. SplitTreeAdder is the concept builder — visual, animated, builds the mental model of why the split works. The book teaches the concept first, then drills the boxes. Our app does the same: a child enters a lesson, sees 2-3 SplitTree problems in Learn Mode, then graduates to 5-7 GuidedBoxFill problems in Practice Mode.

#### What the Child Sees
```
┌──────────────────────────────────────────────┐
│                                              │
│            9   +   4   =   ?                 │  ← Equation bar
│                                              │
│  ┌──────────┐         ┌──────────┐           │
│  │          │         │          │           │
│  │    9     │         │    4     │           │  ← Two number cards
│  │  (tap?)  │         │  (tap?)  │           │     both pulsing
│  │          │         │          │           │
│  └──────────┘         └──────────┘           │
│                                              │
│   "Which number do you want to split?"       │  ← Prompt text
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │ ● ● ● ● ●    ● ● ● ● ○              │     │  ← Ten-frame
│  │ ○ ○ ○ ○ ○    ○ ○ ○ ○ ○              │     │     (9 red dots)
│  └─────────────────────────────────────┘     │
│                                              │
│        ○ ○ ○ ○                               │  ← Loose dots (4 blue)
│                                              │
└──────────────────────────────────────────────┘
```

- After child taps 4:

```
┌──────────────────────────────────────────────┐
│            9   +   4   =   ?                 │
│                                              │
│  ┌──────────┐         ┌──────────┐           │
│  │    9     │         │    4     │           │
│  └──────────┘         └─────┬────┘           │
│                           ┌─┴─┐              │
│                          ╱     ╲             │  ← Split tree opens
│                      ┌──┐     ┌───┐          │     with animation
│                      │🔵│     │🔵│          │
│                      └──┘     └───┘          │
│                     drag →   stays           │
│                                              │
│  Ten-frame: ● ● ● ● ●  ● ● ● ● ○             │
│             ○ ○ ○ ○ ○  ○ ○ ○ ○ ○             │
│                                              │
│  Loose dots: ○ ○ ○ ○  (child drags 1 to      │
│                         ten-frame)           │
└──────────────────────────────────────────────┘
```

- After drag completes → ten-frame fills to 10 → celebration → final equation:

```
┌──────────────────────────────────────────────┐
│                                              │
│      ✨ 10 ✨  +   3   =   13               │
│                                              │
│  Ten-frame: ● ● ● ● ●  ● ● ● ● ●  (full!)    │
│             ○ ○ ○ ○ ○  ○ ○ ○ ○ ○             │
│                                              │
│  Remaining: ○ ○ ○  (3 dots below)            │
│                                              │
│              ⭐ Well done! ⭐               │
│                                              │
└──────────────────────────────────────────────┘
```

#### Props Interface
```ts
// src/components/interactives/SplitTreeAdder.tsx

interface SplitTreeAdderProps {
  data: SplitTreeProblem;
  onComplete: (result: ActivityResult) => void;
}

interface SplitTreeProblem {
  mode: "addition" | "subtraction";
  numberA: number;               // left number (e.g., 9)
  numberB: number;               // right number (e.g., 4)
  allowSplitChoice: boolean;     // true = child picks, false = preset
  presetSplit?: "A" | "B";      // used when allowSplitChoice is false
  expectedAnswer: number;        // 13
}

// Reuse ActivityResult from GuidedBoxFill — same shape
```

#### State Machine
```ts
interface SplitTreeState {
  phase:
    | "show-problem"          // equation + ten-frame + loose dots appear
    | "choose-split"          // both number cards pulse, child taps one
    | "split-open"            // tree animates open, two empty nodes appear
    | "fill-split"            // child fills split values (tap or drag)
    | "drag-to-ten"           // child drags dots from split to ten-frame
    | "ten-complete"          // "10!" animation plays
    | "final-answer"          // child sees 10 + remainder, taps answer
    | "celebrate";            // confetti, star, onComplete

  splitTarget: "A" | "B" | null;
  splitValues: [number | null, number | null]; // what child entered
  correctSplit: [number, number] | null;       // computed after choice
  tenFrameCount: number;                       // animated 0 → A → 10
  remainderCount: number;                      // dots left after drag
  userFinalAnswer: number | null;
  mistakes: number;
  startTime: number;
}

type SplitTreeAction =
  | { type: "CHOOSE_SPLIT"; target: "A" | "B" }
  | { type: "SET_SPLIT_VALUE"; index: 0 | 1; value: number }
  | { type: "CONFIRM_SPLIT" }
  | { type: "DRAG_DOT_TO_FRAME" }     // called per dot dragged
  | { type: "TEN_FRAME_FULL" }         // triggered when count hits 10
  | { type: "SUBMIT_FINAL"; answer: number }
  | { type: "WRONG_ANSWER" }
  | { type: "CELEBRATE" };
```

#### Phase-by-Phase Logic
- `show-problem` (1.5s auto-advance)

    - Equation animates in at top
    - Ten-frame renders with numberA red dots (if splitting B) or empty (if choice pending)
    - numberB blue loose dots appear below ten-frame
    - Auto-advance to choose-split after animation settles`choose-split`
    - Both number cards get a pulsing border + scale animation
    - Prompt: "Which number do you want to split?"
    - Child taps one → dispatch CHOOSE_SPLIT
    - Reducer computes correctSplit:
```ts
case "CHOOSE_SPLIT": {
  const other = action.target === "A" ? state.numberB : state.numberA;
  const target = action.target === "A" ? state.numberA : state.numberB;
  const give = 10 - other;
  const keep = target - give;
  return {
    ...state,
    phase: "split-open",
    splitTarget: action.target,
    correctSplit: [give, keep],
    tenFrameCount: other,  // pre-fill ten-frame with the OTHER number
  };
}
```
- If allowSplitChoice is false, skip this phase entirely

- `split-open` (animation phase, ~600ms)
    - The chosen number card "cracks open" — Framer Motion layout + scale
    - Two empty circle nodes appear below it in a tree formation
    - The branch lines animate drawing downward (SVG path animation or Framer)
    - Auto-advance to fill-split

- `fill-split`
    - Two empty circles below the split target, same number pad as GuidedBoxFill
    - Child fills first circle → if correct, locks green → cursor to second
    - Child fills second circle → validate both sum to the split target
    - If wrong: red flash, increment mistakes, clear and retry
    - Hint after 2 wrong: the "give" amount subtly pulses near the ten-frame's empty slot
    - On both correct → dispatch CONFIRM_SPLIT → advance to drag-to-ten
- `drag-to-ten` — THE CORE INTERACTION
    - The loose dots below ten-frame are now split into two groups visually
    - The "give" group (e.g., 1 dot) is highlighted and draggable
    - Child drags dots one-by-one to the ten-frame empty slots
    - Each successful drop: pop sound, tenFrameCount++
    - Use @dnd-kit/core: each dot is a <Draggable>, each empty ten-frame cell is a <Droppable>
```ts
// Simplified drag handler
function handleDragEnd(event: DragEndEvent) {
  if (event.over?.id.startsWith("frame-slot-")) {
    dispatch({ type: "DRAG_DOT_TO_FRAME" });
    audio.playEffect("pop");
    
    if (state.tenFrameCount + 1 === 10) {
      // Small delay then trigger the celebration
      setTimeout(() => dispatch({ type: "TEN_FRAME_FULL" }), 300);
    }
  }
}
```
For younger/struggling kids, add an auto-snap: if the dot is dragged within 40px of an empty slot, it snaps in. Don't require precision.

- `ten-complete` (animation phase, ~1s)

    - Ten-frame pulses gold, "10!" text scales up with spring animation
    - The remaining dots (the "keep" group) slide to a separate area below
    - The equation at top morphs: 9 + 4 cross-fades to 10 + 3
    - Auto-advance to final-answer

- `final-answer`
    - Equation shows 10 + 3 = [___]
    - Number pad appears (include teen numbers 10-18)
    - Child taps answer → if correct → celebrate
    - Wrong → same gentle retry pattern

- `celebrate`
    - Confetti (CSS particles or a tiny library)
    - Star animation
    - "Well done!" text
    - 1.5s delay → onComplete(result)

#### The Ten-Frame Component (Extracted + Reusable)

- This will be reused by other components later (BlockGrouper at minimum), so build it as a standalone:
```ts
// src/components/shared/TenFrame.tsx

interface TenFrameProps {
  filledCount: number;          // 0-10, animated
  filledColor: string;          // "red" | "blue" 
  emptySlots: boolean;          // show empty circles or hide them
  droppable: boolean;           // enable @dnd-kit drop zones
  onSlotDrop?: (slotIndex: number) => void;
  size: "sm" | "md" | "lg";    // responsive sizing
}

// Renders a 2×5 grid (standard ten-frame layout):
//  ┌───┬───┬───┬───┬───┐
//  │ ● │ ● │ ● │ ● │ ● │  ← top row (slots 0-4)
//  ├───┼───┼───┼───┼───┤
//  │ ● │ ● │ ● │ ● │ ○ │  ← bottom row (slots 5-9)
//  └───┴───┴───┴───┴───┘
// Fills left-to-right, top-to-bottom
```

#### The Loose Dots Component (Also Reusable)
```ts
// src/components/shared/DraggableDots.tsx

interface DraggableDotsProps {
  count: number;
  color: string;
  groups?: [number, number];     // if split, e.g., [1, 3] shows a gap
  highlightGroup?: 0 | 1;       // which group is draggable
  onDotDragStart?: (dotIndex: number) => void;
}
```

#### Subtraction Mode
When `mode === "subtraction",` the flow inverts:
- Problem: 14 - 6
- Ten-frame starts with 10 filled (since 14 = 10 + 4, show full frame + 4 extra)
- Actually, better visualization: show 14 as one full ten-frame + 4 loose dots
- Child splits 6 into 4 and 2
- First: drag 4 loose dots OFF → now you have exactly 10
- Then: remove 2 from the ten-frame → 8 remain
- This matches the book's logic perfectly.

State machine phases are identical, just the dot movement direction reverses (removing instead of adding).

#### Sample Data
```ts
// src/data/samples/splitTree-samples.ts

export const SPLIT_SAMPLES: SplitTreeProblem[] = [
  // Addition — easy (split small number off 9)
  { mode: "addition", numberA: 9, numberB: 4, 
    allowSplitChoice: true, expectedAnswer: 13 },
  { mode: "addition", numberA: 8, numberB: 5, 
    allowSplitChoice: true, expectedAnswer: 13 },
  
  // Addition — medium (split off 7 or 8)  
  { mode: "addition", numberA: 7, numberB: 6, 
    allowSplitChoice: true, expectedAnswer: 13 },
  
  // Subtraction — easy
  { mode: "subtraction", numberA: 13, numberB: 4, 
    allowSplitChoice: false, presetSplit: "B", expectedAnswer: 9 },
  
  // Subtraction — medium
  { mode: "subtraction", numberA: 14, numberB: 6, 
    allowSplitChoice: true, expectedAnswer: 8 },
];
```

#### Build Instructions
```
Build these files:

1. src/components/shared/TenFrame.tsx
   - 2×5 grid, configurable fill count and colors
   - @dnd-kit droppable slots when droppable=true
   - Framer Motion: dots scale-in when filledCount increases
   - Min cell size: 48px

2. src/components/shared/DraggableDots.tsx  
   - Renders N colored circles in a flexible row
   - Optional split into two visual groups with a gap
   - @dnd-kit draggable on highlighted group
   - 48px dot diameter minimum

3. src/components/interactives/SplitTreeAdder.tsx
   - useReducer with the 8-phase state machine above
   - Renders: equation bar, two number cards, split tree (SVG lines),
     TenFrame, DraggableDots, number pad (reuse pattern from GuidedBoxFill)
   - Framer Motion for: split tree opening, dot dragging feedback,
     ten-frame completion pulse, equation cross-fade
   - Supports both addition and subtraction modes
   - Sound hooks: pop (dot placed), ding (step correct), 
     celebration (complete), gentle-buzz (wrong)

4. src/data/samples/splitTree-samples.ts

5. Dev route: /dev/splittree with problem picker and mode toggle

Test: npm run dev → /dev/splittree → complete a full 9+4 problem 
and a full 14-6 problem with no console errors.
```

  **Output:** [2026-04-06]
#### Component #2: SplitTreeAdder (Learn Mode) — COMPLETED ✅

**What was built:**

1. **src/types/curriculum.ts** — added `SplitTreeProblem` interface
2. **src/components/shared/TenFrame.tsx** — Reusable 2x5 grid:
   - Configurable `filledCount`, `filledColor`, `size` (sm/md/lg)
   - @dnd-kit droppable slots when `droppable=true` (empty cells become drop targets)
   - Framer Motion spring animation when dots appear
   - 48px minimum cell size at `md`
3. **src/components/shared/DraggableDots.tsx** — Reusable dot renderer:
   - Optional groups split with visual separator
   - `highlightGroup` makes one group @dnd-kit draggable with yellow ring
   - 48px dot diameter, touch-friendly with grab cursor
4. **src/components/interactives/SplitTreeAdder.tsx** — 8-phase state machine:
   - `show-problem` → `choose-split` → `split-open` → `fill-split` → `drag-to-ten` → `ten-complete` → `final-answer` → `celebrate`
   - SVG branch lines animate drawing downward
   - Number cards pulse during choice phase
   - `DndContext` with `PointerSensor` + `TouchSensor` (40px snap tolerance)
   - Number pad with conditional teen row for final answer
   - Hints after 2 mistakes
   - Sound hooks: `pop` (dot placed), `ding` (ten complete), `stars-earned` (celebrate), `try-again` (wrong)
   - Supports both addition and subtraction modes
5. **src/data/samples/splitTree-samples.ts** — 5 problems (3 addition, 2 subtraction)
6. **Dev route** — `/dev/splittree` with problem picker, mode display, and result JSON

**System Health:**
- All done. TypeScript clean, Vite builds in 396ms.
- **Test:** Run `npm run dev` and navigate to `/dev/splittree`.

---

### Localization & UI Cleanup — COMPLETED ✅ [2026-04-06]

**What was changed:**

- **HTML & Metadata** — `index.html` updated to `lang="en"` and `dir="ltr"`. Title set to "Primary 1 Math".
- **Global Settings** — `src/context/AppContext.tsx` updated with `DEFAULT_SETTINGS` set to `language: "en"`.
- **UI Translation** — 
  - `SplashScreen.tsx`: Translated to English (Welcome!, Let's Go!).
  - `ChapterMap.tsx`: Heading set to "Chapters", buttons show English primary label with Arabic as an optional secondary sub-label.
  - `LessonScreen.tsx`: Updated to English "Back" and "Coming soon" labels. Header and lesson cards show English primary label with Arabic secondary.
- **Refactor & Cleanup** — 
  - Removed all `isAr` conditional checks from screen components.
  - Cleaned up unused imports and variables identified by TypeScript lints.
  - Verified `src/data/chapters.ts` titles match the exact English terminology from the textbook.

**System Health:**
- TypeScript clean, Vite builds in <3.5s.
- **Test:** Run `npm run dev` and check that the app starts in English and LTR mode.
---

### The Critical Decision: Ch13 Subtraction Method

- Method A (What We Built) -> Decompose the subtrahend:
```
14 - 6 = ?
Split 6 into 4 and 2
14 - 4 = 10
10 - 2 = 8
```

- Method B (Found in the Book) -> Decompose the minuend:
```
14 - 8 = ?
Split 14 into 10 and 4
10 - 8 = 2
2 + 4 = 6
```
- These teach different mental models. Method A says "chip away at the number you're subtracting." Method B says "break your big number into a ten and leftovers, subtract from the ten, recombine." The exam will expect the method the book teaches.

#### Query4: `queries\Q4.md`


#### Adapter Gaps — Priority Order

```
Priority 1 (do now): Add GuidedBoxProblem to the ActivityData 
union in curriculum.ts. Remove the cast in the adapter.

Priority 2 (do now): Expand the adapter to loop through all 
sub-items in multi-item Flash problems, not just the first. 
This should multiply available content 3-5x.

Priority 3 (do now): Preserve the context field ("cheese-wedge", 
"tennis-ball") in the adapted data. Add an optional contextHint 
field to the base Activity interface. Components can use it for 
flavor text or icon selection.

Priority 4 (defer): Area grid cell coordinates — we'll handle 
this when building the AreaGrid component. A count-only mode is 
fine for now. #TODO

Priority 5 (defer): The 5 skipped problem types — we'll map them 
as we build each corresponding component. #TODO
```

**Output:** [2026-04-06]
● **Done.** 3x–4x content expansion confirmed: 19 Flash problems → 48 activities.

**Summary of what changed:**

**P1 — src/types/curriculum.ts**
- `GuidedBoxProblem` added to the `ActivityData` union — no more `as unknown as Activity["data"]` casts anywhere.
- `contextHint?: string` added to `Activity` interface with JSDoc.

**P2 — src/lib/adapters/flashDataAdapter.ts**
- All adapter functions now return `Activity[]` instead of `Activity | null`.
- `adaptFlashChapter` uses `activities.push(...results)`.
- Every multi-item type now loops: `adaptMultipleChoiceVisual`, `adaptVisualSelection`, `adaptMatching`, `adaptFillInBlanks`, `adaptTenGrouping`, `adaptPlaceValueCounting`.
- `adaptAreaGridCounting` emits one activity per adjacent pair of shapes.
- **Result:** 19 problems → 48 activities across ch10–14.

**P3 — contextHint populated**
- **Ch10 multiple-choice-visual:** correct option's context (e.g. "cheese-wedge").
- **Ch10 visual-selection:** the 3D source shape name.
- **Ch10 matching:** each shape's context (e.g. "brown-box").
- **Ch11 unit-counting:** comma-joined container contexts (e.g. "green, orange, brown-clay").
- **Ch11 area-grid-counting:** shape description pair (e.g. "F-like vs Hash-like").

---

### Component #3: `HundredsChart`

- Ch14 is 9 lessons — the biggest chapter. The hundreds chart is its anchor visual. Kids will see it on the exam.

#### What the Child Sees

- A 10×10 grid numbered 1-100. The component supports multiple interaction modes driven by the problem data:

```
Mode: "fill-missing"
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│  1 │  2 │  3 │  4 │  5 │  6 │  7 │  8 │  9 │ 10 │
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │ 19 │ 20 │
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ 21 │ 22 │[  ]│ 24 │ 25 │ 26 │ 27 │[  ]│ 29 │ 30 │  ← blanks
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ 31 │ 32 │ 33 │ 34 │ 35 │ 36 │ 37 │ 38 │ 39 │ 40 │
│... │    │    │    │    │    │    │    │    │    │
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```
```
Mode: "jump-by-10"    (child taps a cell, +10 row highlights)
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│    │    │  3 │    │    │    │    │    │    │    │  ← highlighted
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │ 13 │    │    │    │    │    │    │    │  ← highlighted
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │[  ]│    │    │    │    │    │    │    │  ← child fills: 23
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │ 33 │    │    │    │    │    │    │    │  ← highlighted
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```
```
Mode: "color-row" / "color-column"    (highlight a full row or column)
Child taps to color all cells in row 5 (41-50) → counter shows "10 colored"
Used for teaching: "Each row has 10 numbers"
```

#### Props Interface
```ts
interface HundredsChartProps {
  data: HundredsChartProblem;
  onComplete: (result: ActivityResult) => void;
}

interface HundredsChartProblem {
  mode: "fill-missing" | "jump-by-10" | "color-pattern" | "find-number";
  
  // For fill-missing: which cells are blank
  missingCells?: number[];
  
  // For jump-by-10: the starting number and direction
  jumpStart?: number;
  jumpDirection?: "down" | "up";  // +10 or -10
  jumpBlanks?: number[];          // which jumps are blank
  
  // For color-pattern: which cells to pre-highlight, which to ask
  preHighlighted?: number[];
  targetCells?: number[];         // child must color these
  patternRule?: string;           // "Color all numbers that end in 5"
  
  // For find-number: place-value riddle
  riddle?: string;                // "I have 3 tens and 7 ones. Who am I?"
  correctCell?: number;           // 37
}
```

#### State Machine
```ts
interface ChartState {
  phase: "interactive" | "checking" | "celebrate";
  filledCells: Record<number, number | null>;  // cellPosition → userValue
  coloredCells: Set<number>;
  selectedCell: number | null;
  currentBlankIndex: number;      // which blank is active
  mistakes: number;
  startTime: number;
}

type ChartAction =
  | { type: "TAP_CELL"; cellNumber: number }
  | { type: "SUBMIT_VALUE"; value: number }
  | { type: "COLOR_CELL"; cellNumber: number }
  | { type: "CHECK_ANSWERS" }
  | { type: "WRONG_CELL" }
  | { type: "CELEBRATE" };
```

#### Grid Rendering Logic
```ts
// The grid is always 10×10. Cells are numbered 1-100.
// Row index = Math.floor((n - 1) / 10)
// Col index = (n - 1) % 10

function renderCell(n: number, state: ChartState, problem: HundredsChartProblem) {
  const isMissing = problem.missingCells?.includes(n);
  const isHighlighted = problem.preHighlighted?.includes(n);
  const isColored = state.coloredCells.has(n);
  const isSelected = state.selectedCell === n;
  const userValue = state.filledCells[n];

  if (isMissing && userValue === null) {
    // Empty input cell — tappable, blue border
    return <BlankCell onTap={() => dispatch({ type: "TAP_CELL", cellNumber: n })} />;
  }
  if (isMissing && userValue !== null) {
    // Filled by student — green if correct, show value
    return <FilledCell value={userValue} correct={userValue === n} />;
  }
  if (isHighlighted || isColored) {
    // Colored/highlighted — yellow or pattern color
    return <HighlightedCell value={n} />;
  }
  // Normal cell
  return <NormalCell value={n} />;
}
```

#### Teaching the +10/-10 Pattern (Book's Core Concept)

- The book specifically teaches: moving down one row = +10, moving right one cell = +1. The component must make this visually obvious:
```
// When a child fills a blank in jump-by-10 mode,
// draw an animated arrow from the previous number to the new one
// Label the arrow "+10"

// Example: jumping from 3
// 3 → [arrow "+10"] → 13 → [arrow "+10"] → [__] → [arrow "+10"] → 33

// The arrows are SVG overlays on the grid, animated with Framer Motion
```

#### Key Visual Design Rules
```
- Cell size: 40px minimum (10 columns must fit on a phone screen)
- On phones: allow horizontal scroll or pinch-zoom on the grid
- Active/selected blank: blue-500 border, subtle pulse
- Correct fill: green-100 bg, green-600 text, checkmark icon
- Highlighted column for +10: light yellow stripe down the column
- Number font: monospace or tabular-nums (alignment matters in a grid)
- The grid should feel like the actual printed 100-chart they see in class
```

#### Generator Function
```ts
// src/lib/generators/hundredsChartGenerator.ts

export function generateFillMissing(
  count: number = 5, 
  region?: { rowStart: number; rowEnd: number }
): HundredsChartProblem {
  // Pick `count` random cells to blank out
  const min = region ? (region.rowStart - 1) * 10 + 1 : 1;
  const max = region ? region.rowEnd * 10 : 100;
  const missing: number[] = [];
  while (missing.length < count) {
    const n = randomInt(min, max);
    if (!missing.includes(n)) missing.push(n);
  }
  return { mode: "fill-missing", missingCells: missing.sort((a, b) => a - b) };
}

export function generateJumpBy10(startCol?: number): HundredsChartProblem {
  const col = startCol ?? randomInt(1, 10);
  // Full column: col, col+10, col+20, ..., col+90
  const fullJump = Array.from({ length: 10 }, (_, i) => col + i * 10);
  // Blank out 3-4 of them (not the first)
  const blanks = pickRandom(fullJump.slice(1), randomInt(3, 4));
  return {
    mode: "jump-by-10",
    jumpStart: col,
    jumpDirection: "down",
    preHighlighted: fullJump.filter(n => !blanks.includes(n)),
    jumpBlanks: blanks.sort((a, b) => a - b),
  };
}

export function generateFindNumber(): HundredsChartProblem {
  const tens = randomInt(1, 9);
  const ones = randomInt(0, 9);
  const answer = tens * 10 + ones;
  return {
    mode: "find-number",
    riddle: `I have ${tens} tens and ${ones} ones. Who am I?`,
    correctCell: answer,
  };
}
```

#### Build Instructions
```
Build src/components/interactives/HundredsChart.tsx

Requirements:
- 10×10 CSS Grid, cells numbered 1-100
- useReducer with phases: interactive → checking → celebrate
- Four modes driven by HundredsChartProblem.mode:
  a) fill-missing: blank cells are tappable, number pad appears 
     at bottom, child fills value, validate against cell position
  b) jump-by-10: vertical column highlighted, some cells blank,
     SVG arrow overlays labeled "+10" between filled cells,
     animate arrows with Framer Motion
  c) color-pattern: child taps cells to toggle color, instruction 
     text at top describes the pattern
  d) find-number: riddle text at top, child taps the correct cell,
     wrong taps flash red briefly
- Number pad: show 0-9 for single digits, but for fill-missing the 
  input needs to accept 1-100 (two-digit input with confirm button)
- Cell sizing: min 40px, responsive — on screens < 500px wide, 
  allow horizontal scroll with snap
- Reuse sound hooks from AppContext
- Generator: src/lib/generators/hundredsChartGenerator.ts with 
  generateFillMissing, generateJumpBy10, generateFindNumber
- Sample data: src/data/samples/hundredsChart-samples.ts with 
  one sample per mode
- Dev route: /dev/hundreds with mode tabs

Test: all four modes functional at /dev/hundreds
```

**Output**

