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
● **Done.** TypeScript clean, build in 461ms.

**What was built:**

- **src/types/curriculum.ts** — `HundredsChartData` expanded from 3 flat fields to a full mode-discriminated shape covering all 4 interaction modes.
- **src/lib/generators/hundredsChartGenerator.ts**
  - `generateFillMissing(count, region?)` — blanks N cells, optionally within a row range.
  - `generateJumpBy10(startCol?)` — picks a column, pre-fills anchors, blanks 3-4 middle entries.
  - `generateColorPattern(type, param)` — multiples-of-10, single column, or single row; pre-highlights half as a hint.
  - `generateFindNumber()` — random place-value riddle ("I have X tens and Y ones…").
- **src/components/interactives/HundredsChart.tsx** — 10×10 CSS grid with four modes:
  - `fill-missing`: tap blank → number pad → validate against cell position, auto-advances to next blank.
  - `jump-by-10`: yellow column stripe + ↓+10 Framer Motion labels between confirmed cells; blanks in the column fill sequentially.
  - `color-pattern`: tappable cells toggle green; wrong taps shake-and-clear; dashed hint border on targets.
  - `find-number`: full grid tappable; correct cell → celebrate, wrong → shake.
  - Cells use `tabular-nums` monospace font, 36px minimum, overflow-x scroll on narrow screens.
  - `useReducer` with phase: `interactive` → `celebrate`; `wrong-cell` set cleared after 400ms.
- **Dev route** — `/dev/hundreds` with 4 mode tabs + reset + result JSON output.

**System Health:**
- TypeScript clean, Vite builds in 461ms.
- **Test:** Run `npm run dev` and navigate to `/dev/hundreds`.

---

### Ch13 Patch

#### Subtraction Both-Methods Patch

- The book teaches both. We support both.
```
PATCH: Support both subtraction methods in GuidedBoxFill and SplitTreeAdder.

1. src/lib/generators/guidedBoxGenerator.ts — add generateUse10SubtractionMethodA:

Method A (split minuend — "By spliting the greater number"):
  For 14 - 6:
  Step 1: "You cannot subtract 6 from 4"          (no blank, info only)
  Step 2: "Split 14 into {0} and {1}"             [10, 4]
  Step 3: "Subtract 6 from 10 to get {0}"         [4]
  Step 4: "{0} and {1} make {2}"                   [4, 4, 8]

Rename existing subtraction generator to generateUse10SubtractionMethodB.

Add a wrapper generateUse10Subtraction(minuend, subtrahend, method: "A" | "B" | "both")
- "both" returns two problems, one per method, for the same equation.

2. src/components/interactives/GuidedBoxFill.tsx — add support for 
info-only steps (steps where revealAfterPrevious=false and blanks is 
empty array). Render as plain text with a lightbulb icon, no input needed.
Auto-advance to next step after 1.5s.

3. src/components/interactives/SplitTreeAdder.tsx subtraction mode:
When allowSplitChoice=true and mode="subtraction", the choose-split 
phase now asks: "Which number do you want to split?"
- If child picks the minuend (14): ten-frame shows 10, loose dots show 4,
  child removes 6 from the ten-frame, recombines remainder with the 4.
- If child picks the subtrahend (6): existing flow (already built).

4. src/data/samples/make10-samples.ts — add one Method A subtraction sample:
  { equation: "14 - 6", type: "subtraction", method: "A" }

5. Update generateAllUse10Problems to produce both methods for each equation.
```

**Output:** [2026-04-06]
● **Done.** TypeScript clean, build in 396ms.

- **src/components/interactives/GuidedBoxFill.tsx**:
  - `initState`: step 0 gets "info" status when `blanks.length === 0`.
  - `ADVANCE_INFO` reducer case: marks current step correct, advances to next (setting it "info" or "active" based on blanks).
  - `SUBMIT`: now sets next step as "info" instead of "active" when it has no blanks.
  - Auto-advance `useEffect`: fires `ADVANCE_INFO` after 1500ms whenever current step status is "info".
  - `StepRow`: renders "info" status with 💡 icon, amber background, plain template text (no blanks).
  - Number pad: hidden when current step has `blanks.length === 0`.

- The `SAMPLE_SUB_14_6_METHOD_A` flow will now correctly: show "You cannot subtract 6 from 4." as an amber info card → auto-advance after 1.5s → proceed to step 2.
---

### Component #4: BlockGrouper + NumberLine

- These two finish Ch14. They're simpler than what's been built — no drag-to-ten-frame complexity. Sending both in one spec.

#### 4A: `BlockGrouper`

- The book teaches: loose items → group by 10s → read the place value.
- What the child sees:

```
"Count the stars. Group them into tens."

  ☆ ☆ ☆ ☆ ☆  ☆ ☆ ☆ ☆ ☆    ← 10 (drag a lasso around them)
  ☆ ☆ ☆ ☆ ☆  ☆ ☆ ☆ ☆ ☆    ← 10
  ☆ ☆ ☆ ☆                    ← 4 remaining

  Groups of 10: [__]    Ones left: [__]    Total: [__]
                  2              4              24
```

##### Props:
```ts
interface BlockGrouperProps {
  data: BlockGrouperProblem;
  onComplete: (result: ActivityResult) => void;
}

interface BlockGrouperProblem {
  totalItems: number;           // e.g., 34
  visualType: "stars" | "blocks" | "dots";
  expectedTens: number;         // 3
  expectedOnes: number;         // 4
  // interaction mode:
  mode: "group-then-count"      // drag to group, then fill values
      | "count-only";           // groups pre-made, just fill tens/ones/total
}
```

##### State machine — simple, 3 phases:
```ts
phase: "grouping" | "counting" | "celebrate"

// grouping: items scattered, child taps/selects 10 items at a time
//   → each group of 10 snaps into a horizontal "tens rod" with a rubber band
//   → remaining items stay loose
//   → when all possible groups of 10 are made, auto-advance to counting

// counting: three input boxes appear (tens, ones, total)
//   → child fills with number pad
//   → all three must be correct to advance

// count-only mode: skip grouping phase, show pre-grouped rods + loose items
```

##### Interaction for grouping phase — keep it simple:

- Don't do individual lasso selection (too fiddly for 7-year-olds). Instead:
```ts
// Show a "Make a group of 10" button at the bottom.
// Items are displayed in a flowing grid.
// Child taps items one at a time — each tapped item highlights.
// When 10 are highlighted, they auto-animate into a rod.
// OR: child taps the button, and the next 10 unhighlighted items 
// auto-group. Simpler, still teaches the concept.

// I recommend the button approach for speed. 
// The tap-to-select approach is better pedagogy but more code.
// Build button approach first, tap-to-select as enhancement.
```

##### Generator:

```ts
export function generateBlockGrouper(
  difficulty: 1 | 2 | 3
): BlockGrouperProblem {
  // Diff 1: 10-30 items, clean tens (20, 30) 
  // Diff 2: 20-50 items, has ones remainder
  // Diff 3: 50-99 items
  const ranges = { 1: [10, 30], 2: [20, 50], 3: [50, 99] };
  const [min, max] = ranges[difficulty];
  let total = randomInt(min, max);
  if (difficulty === 1) total = Math.round(total / 10) * 10;
  
  return {
    totalItems: total,
    visualType: pick(["stars", "blocks", "dots"]),
    expectedTens: Math.floor(total / 10),
    expectedOnes: total % 10,
    mode: difficulty === 1 ? "count-only" : "group-then-count",
  };
}
```

#### 4B: NumberLine

- The book uses number lines with jumps — a frog or kangaroo hops along. The child fills in missing landing points.
- What the child sees:
```
"Complete the number line."

  0    10    20   [__]   40   [__]   60    70   [__]   90   100
  ├────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
       🐸→        🐸→        🐸→
       +10        +10        +10

  Number pad: [0-100]
```

- Also used for smaller ranges:
```
"Jump by 2s."

  0    2    4   [__]   8   [__]   12   14
  ├────┼────┼────┼────┼────┼────┼─────┼────┤
       🐸→  🐸→  🐸→
```

##### Props:
```ts
interface NumberLineProps {
  data: NumberLineProblem;
  onComplete: (result: ActivityResult) => void;
}

interface NumberLineProblem {
  rangeStart: number;
  rangeEnd: number;
  jumpSize: 1 | 2 | 5 | 10;
  points: NumberLinePoint[];      // all points on the line
  showJumpArrows: boolean;        // show hop arrows between points
}

interface NumberLinePoint {
  value: number;
  type: "labeled" | "blank";     // blank = child fills in
}
```
##### State:
```ts
interface NumberLineState {
  phase: "filling" | "celebrate";
  currentBlankIndex: number;      // which blank is active (left to right)
  filledValues: Record<number, number | null>;  // pointIndex → value
  mistakes: number;
  startTime: number;
}
```
##### Rendering:

```ts
// Horizontal scrollable container
// Points are evenly spaced flex items
// Between each pair of points: a curved arrow SVG (hop arc)
//   labeled with jumpSize ("+10", "+2", etc.)
// Blanks are styled like GuidedBoxFill blanks — tappable, blue border
// Active blank pulses, number pad appears at bottom
// Correct fill → green, lock, advance to next blank (left to right)
// After all blanks filled → celebrate

// On narrow screens: horizontal scroll with snap-to-blank
// The active blank auto-scrolls into center view
```

##### Generator:
```ts
export function generateNumberLine(
  jumpSize: 1 | 2 | 5 | 10,
  difficulty: 1 | 2 | 3
): NumberLineProblem {
  const maxEnd = jumpSize === 1 ? 20 : jumpSize === 2 ? 30 : 100;
  const start = 0;
  const end = difficulty === 1 ? maxEnd / 2 : maxEnd;
  
  const points: NumberLinePoint[] = [];
  for (let v = start; v <= end; v += jumpSize) {
    points.push({ value: v, type: "labeled" });
  }
  
  // Blank out some middle points (never first or last)
  const blankCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 5;
  const blankable = points.slice(1, -1);
  const toBlanks = pickRandom(blankable, Math.min(blankCount, blankable.length));
  for (const bp of toBlanks) {
    const idx = points.indexOf(bp);
    points[idx] = { ...points[idx], type: "blank" };
  }
  
  return {
    rangeStart: start,
    rangeEnd: end,
    jumpSize,
    points,
    showJumpArrows: true,
  };
}
```
#### Build Instructions 
```
Build two components that complete Chapter 14:

1. src/components/interactives/BlockGrouper.tsx
   - Flowing grid of visual items (stars/blocks/dots as Unicode or SVG)
   - "Make a group of 10" button: auto-selects next 10 ungrouped items,
     animates them into a horizontal "tens rod" with Framer Motion layout
   - After all groups made: three input boxes (tens, ones, total)
   - Number pad 0-9 for tens/ones boxes, 0-99 for total box
   - useReducer: grouping → counting → celebrate
   - count-only mode: skip grouping, show pre-formed rods

2. src/components/interactives/NumberLine.tsx
   - Horizontal flex layout with evenly spaced points
   - SVG curved arrows between points (arc path) labeled with jump size
   - Blank points are tappable input boxes
   - Auto-scroll active blank into view on narrow screens
   - Fill left-to-right, same number pad pattern as other components
   - useReducer: filling → celebrate
   - Optional frog emoji (🐸) that hops along with each correct fill

3. Generators:
   - src/lib/generators/blockGrouperGenerator.ts
   - src/lib/generators/numberLineGenerator.ts

4. Sample data:
   - src/data/samples/blockGrouper-samples.ts (3 difficulties)
   - src/data/samples/numberLine-samples.ts (jump by 2, 5, 10)

5. Dev routes: /dev/blockgrouper and /dev/numberline

6. Update ActivityRenderer switch to include both new conceptKeys:
   "place-value-group" → BlockGrouper
   "place-value-number-line" → NumberLine

Test: both dev routes functional, all modes working.
```

**Output:** [2026-04-06]
● **Done**
Implemented BlockGrouper + NumberLine.

What landed:
- New Chapter 14 interactives: `BlockGrouper.tsx` and `NumberLine.tsx`
- New generators: `blockGrouperGenerator.ts` and `numberLineGenerator.ts`
- New sample data: `blockGrouper-samples.ts` and `numberLine-samples.ts`
- New dev screens/routes: `DevBlockGrouper.tsx`, `DevNumberLine.tsx`, plus route wiring in `App.tsx`
- Small type extensions in `curriculum.ts` so `place-value-group` can express mode and `place-value-number-line` can express arrow visibility

**Verification:**
- `npx tsc -b` passed
- `npm run build` passed after running outside the sandbox

---

### ActivityRenderer — COMPLETED ✅ [2026-04-06]

```
Wire up ActivityRenderer. Create src/components/ActivityRenderer.tsx 
with the switch statement mapping all conceptKeys built so far:

  "addition-make-10" → SplitTreeAdder
  "subtraction-use-10" → SplitTreeAdder  
  "guided-box-make10" → GuidedBoxFill
  "guided-box-sub10" → GuidedBoxFill
  "place-value-hundreds-chart" → HundredsChart
  "place-value-group" → BlockGrouper
  "place-value-number-line" → NumberLine

Default case: render a "Coming soon" placeholder card with the 
conceptKey displayed. This lets us test the full lesson flow 
even before all widgets exist.
```

**Output:** [2026-04-06]
● **Done.** Added `ActivityRenderer.tsx` and wired it into `LessonScreen.tsx`. Lesson activities now render through a central switch.

**Integration Details:**
- Added `guided-box-make10` and `guided-box-sub10` to `curriculum.ts` for explicit routing.
- Built a thin adapter in `ActivityRenderer` to map legacy payload types to `SplitTreeProblem` props.
- Added "Coming soon" fallback card for unknown/unbuilt conceptKeys.

**Verification:**
- `npx tsc -b` passed, and `npm run build` passed.

---

### Component #5: AreaGrid (Ch11) — COMPLETED ✅ [2026-04-06]

- What the Book Does
Two shapes drawn on a square grid. Child counts the colored squares in each shape. Questions: "Which has the larger area?", "How many more squares?"

#### What the Child Sees
```
"Count the squares. Which shape has the larger area?"

  ┌───┬───┬───┬───┬───┬───┐
  │🔵│🔵 │🔵│   │🟠│🟠 │
  ├───┼───┼───┼───┼───┼───┤
  │🔵│🔵 │   │   │🟠│🟠 │
  ├───┼───┼───┼───┼───┼───┤
  │🔵│   │   │   │🟠 │🟠│
  ├───┼───┼───┼───┼───┼───┤
  │   │   │   │   │🟠│   │
  └───┴───┴───┴───┴───┴───┘

  Blue: [__] squares     Orange: [__] squares
         5                        7

  Which has the larger area?  [Blue]  [Orange] ← child taps
  ```
  - Also used in count-only mode (from Flash's data where we only have unit counts, no cell coordinates):
```
"Shape A has 8 square units. Shape B has 5 square units.
 Which has the larger area?"

  [Shape A]    [Shape B]    ← big tappable buttons
```

#### Props
```ts
interface AreaGridProps {
  data: AreaGridProblem;
  onComplete: (result: ActivityResult) => void;
}

interface AreaGridProblem {
  mode: "grid-visual" | "count-compare";
  
  // grid-visual mode: full grid with colored cells
  gridRows?: number;
  gridCols?: number;
  shapes?: {
    label: string;           // "Blue" / "Orange"
    color: string;           // tailwind color key
    cells: [number, number][];  // [row, col] pairs
  }[];
  
  // count-compare mode: just numbers (Flash adapter fallback)
  shapeCounts?: { label: string; count: number; color: string }[];
  
  // question type
  question: "which-larger" | "which-smaller" | "how-many-more" | "count-each";
  correctAnswer: number | string;  // number for "how-many-more", label string for "which-X"
}
```

#### State
```ts
interface AreaGridState {
  phase: "counting" | "comparing" | "celebrate";
  userCounts: Record<string, number | null>;  // label → user's count
  userChoice: string | null;                   // for which-larger/smaller
  userDifference: number | null;              // for how-many-more
  mistakes: number;
  startTime: number;
}

// Flow:
// 1. "counting" — if grid-visual: child taps cells to count each shape
//    (cells flash when tapped to confirm they've been counted)
//    Then fills count boxes.
//    If count-compare: counts are pre-filled, skip to comparing.
//
// 2. "comparing" — child answers the question (tap a shape button, 
//    or enter a number for "how-many-more")
//
// 3. "celebrate"
```

#### Counting Interaction (The Clever Part)

- The book says "Count the squares." Kids at this age often miscount by tapping the same cell twice or skipping one. Build a tap-to-mark mechanic:

```ts
// Child taps a colored cell → it gets a subtle checkmark overlay
// A running counter for that shape's color increments
// Tapping an already-marked cell unmarks it (toggle)
// After marking, the count auto-fills the input box
// Child can also just type the number directly if they counted mentally

// This teaches systematic counting — a key skill at this age
```

#### Generator
```ts
// src/lib/generators/areaGridGenerator.ts

export function generateAreaGrid(difficulty: 1 | 2 | 3): AreaGridProblem {
  const gridSize = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
  
  // Generate two random connected shapes on the grid
  const shapeA = generateConnectedShape(gridSize, randomInt(3, 5 + difficulty));
  const shapeB = generateConnectedShape(gridSize, randomInt(3, 5 + difficulty), shapeA);
  
  const countA = shapeA.length;
  const countB = shapeB.length;
  
  return {
    mode: "grid-visual",
    gridRows: gridSize,
    gridCols: gridSize,
    shapes: [
      { label: "Blue", color: "blue", cells: shapeA },
      { label: "Orange", color: "orange", cells: shapeB },
    ],
    question: pick(["which-larger", "how-many-more"]),
    correctAnswer: countA > countB ? "Blue" 
      : countB > countA ? "Orange" 
      : Math.abs(countA - countB), // for how-many-more
  };
}

// Helper: grow a connected shape by random-walking from a seed cell
function generateConnectedShape(
  gridSize: number, 
  targetSize: number,
  avoid?: [number, number][]
): [number, number][] {
  const cells: [number, number][] = [];
  const avoidSet = new Set((avoid || []).map(([r,c]) => `${r},${c}`));
  
  // Pick a random starting cell not in avoid zone
  let startR: number, startC: number;
  do {
    startR = randomInt(0, gridSize - 1);
    startC = randomInt(0, gridSize - 1);
  } while (avoidSet.has(`${startR},${startC}`));
  
  cells.push([startR, startC]);
  
  while (cells.length < targetSize) {
    // Pick a random existing cell, grow in a random direction
    const [r, c] = pick(cells);
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const [dr, dc] = pick(dirs);
    const nr = r + dr, nc = c + dc;
    const key = `${nr},${nc}`;
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize 
        && !cells.some(([cr,cc]) => cr === nr && cc === nc)
        && !avoidSet.has(key)) {
      cells.push([nr, nc]);
      avoidSet.add(key);
    }
  }
  return cells;
}
```

**Output:** [2026-04-06]
● **Done.** Implemented `AreaGrid` with full visual counting support and content fallback for Chapter 11.

**Summary of what changed:**
- **Interactive widget:** `AreaGrid.tsx` with tap-to-count grid mechanics.
- **Generator:** `areaGridGenerator.ts` with autonomous connected-shape generation.
- **Samples:** `areaGrid-samples.ts` covering multiple difficulty levels.
- **Dev screen/route:** `DevAreaGrid.tsx` and `/dev/areagrid` for UI verification.
- **Renderer hookup:** Added `compare-area` support to `ActivityRenderer.tsx` switch.
- **Data Integration:** Extended `curriculum.ts` and `flashDataAdapter.ts` to support both visual grid counting and count-only fallback modes for Chapter 11.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.

---

### Component #6: CapacityPourer (Ch11) — COMPLETED ✅ [2026-04-06]

- What the Book Does
Compare containers by measuring capacity in cups. "Which has more?", "Arrange from least to most", "How many cups?"

The book verbs: "Circle the container that has more water", "Write how many cups", "Arrange the containers in order from least to most water."

#### Visual Design Decision

- Full liquid-pouring animation is expensive and fragile. Instead, represent capacity with stacked cup icons — a visual bar chart that 7-year-olds instantly understand:
```
"Write how many cups each container holds."

  Container A          Container B          Container C
  ┌─────────┐         ┌──────────────┐         ┌─────────┐
  │  🥤🥤🥤│         │ 🥤🥤🥤🥤🥤│         │  🥤🥤  │
  │  [__]   │         │  [__]        │         │  [__]   │
  └─────────┘         └──────────────┘         └─────────┘
     cups                cups                cups

  "Arrange from least to most:"
  [__] → [__] → [__]                    ← drag to reorder
```

#### Props
```
interface CapacityPourerProps {
  data: CapacityProblem;
  onComplete: (result: ActivityResult) => void;
}

interface CapacityProblem {
  mode: "count-cups" | "compare-two" | "order-multiple" | "difference";
  
  containers: {
    id: string;
    label: string;               // "Container A" or contextHint like "Red jug"
    capacityCups: number;        // the answer
    imageType?: string;          // "jug" | "bottle" | "box" — for icon selection
  }[];
  
  // For compare-two
  compareQuestion?: "which-more" | "which-less";
  
  // For difference
  differenceAnswer?: number;     // |A - B|
  
  // For order-multiple  
  correctOrder?: string[];       // container ids in correct sequence
}
```

#### State
```
interface CapacityState {
  phase: "measuring" | "answering" | "celebrate";
  
  // count-cups: child fills in cup count per container
  userCounts: Record<string, number | null>;
  
  // compare-two: child taps one container
  userChoice: string | null;
  
  // order-multiple: child drags containers into order
  userOrder: string[];
  
  // difference: child enters a number
  userDifference: number | null;
  
  mistakes: number;
  startTime: number;
}
```

#### Interaction Modes

- count-cups: Each container shows a visual stack of cup icons (the answer, but kid needs to count them). Below each stack is an input box. Child counts cups, enters number. All must be correct.

compare-two: Two containers shown with cup stacks. Child taps the one matching the question ("Which has more?"). Simple tap → validate → celebrate.

order-multiple: 3-4 containers shown. Child drags them left-to-right into order slots. Use @dnd-kit/sortable. Validate entire sequence on submit.

difference: Two containers with cup stacks. "How many more cups does A have than B?" Child enters the number.

#### Generator
```ts
export function generateCapacity(
  mode: CapacityProblem["mode"],
  difficulty: 1 | 2 | 3
): CapacityProblem {
  const maxCups = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const containerCount = mode === "compare-two" || mode === "difference" ? 2
    : mode === "order-multiple" ? randomInt(3, 4) : randomInt(2, 3);
  
  const containers = Array.from({ length: containerCount }, (_, i) => ({
    id: `c${i}`,
    label: `Container ${String.fromCharCode(65 + i)}`,
    capacityCups: randomInt(1, maxCups),
    imageType: pick(["jug", "bottle", "box"]),
  }));
  
  // Ensure no ties for compare/order questions
  const caps = new Set(containers.map(c => c.capacityCups));
  if (caps.size < containers.length) {
    containers[containers.length - 1].capacityCups += 1;
  }
  
  const sorted = [...containers].sort((a, b) => a.capacityCups - b.capacityCups);
  
  return {
    mode,
    containers,
    compareQuestion: mode === "compare-two" ? pick(["which-more", "which-less"]) : undefined,
    correctOrder: mode === "order-multiple" ? sorted.map(c => c.id) : undefined,
    differenceAnswer: mode === "difference" 
      ? Math.abs(containers[0].capacityCups - containers[1].capacityCups) 
      : undefined,
  };
}
```

#### Build Instructions
```
Build two Ch11 components:

1. src/components/interactives/AreaGrid.tsx
   - CSS Grid matching gridRows × gridCols
   - Colored cells with tap-to-mark (toggle checkmark overlay)
   - Running count per shape color, auto-fills input boxes
   - count-compare fallback mode: no grid, just labeled counts with 
     tap-to-choose buttons
   - Questions: which-larger (tap shape label), how-many-more (number input)
   - useReducer: counting → comparing → celebrate
   - Cell size: 44px minimum

2. src/components/interactives/CapacityPourer.tsx
   - Cup icons (🥤 or small SVG cup) stacked vertically per container
   - Four modes: count-cups, compare-two, order-multiple, difference
   - order-multiple: @dnd-kit/sortable horizontal reorder
   - Number pad for count/difference inputs
   - useReducer: measuring → answering → celebrate

3. Generators:
   - src/lib/generators/areaGridGenerator.ts 
     (include generateConnectedShape helper)
   - src/lib/generators/capacityGenerator.ts

4. Samples:
   - src/data/samples/areaGrid-samples.ts (one grid-visual, one count-compare)
   - src/data/samples/capacity-samples.ts (one per mode)

5. Dev routes: /dev/areagrid and /dev/capacity

6. Update ActivityRenderer:
   "compare-area" → AreaGrid
   "compare-capacity" → CapacityPourer

Test: all modes functional on both dev routes.
```


**Output:** [2026-04-06]
● **Done.** Implemented `CapacityPourer` and established Chapter 11's core interactive pair (Area + Capacity).

**Summary of what landed:**
- **Interactive widget:** `CapacityPourer.tsx` with four modes (count-cups, compare-two, order-multiple, difference).
- **Measurement Visuals:** Stacked cup indicators (🥤) used to visually represent capacity without complex pouring animations.
- **Generator & Samples:** `capacityGenerator.ts` and `capacity-samples.ts` covering all interaction modes.
- **Renderer Hookup:** Added `compare-capacity` support to `ActivityRenderer.tsx`.
- **Data Integration:** Expanded `curriculum.ts` payloads and updated `flashDataAdapter.ts` to transform Chapter 11 Flash content into the new renderer-friendly shape.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.

---

### Component #7: ShapeIdentifier + ShapeFootprint (Ch10) — COMPLETED ✅ [2026-04-06]

- These two are the simplest interactive widgets in the whole app. Ch10 is pure visual recognition — no math computation.

#### 7A: `ShapeIdentifier`

- Book verb: "Circle the correct shape", "Cross out the shape that does not belong"
```
Mode A: "Which is a Cube shape?"

  [🔵sphere]  [🟩cube]  [🟡cylinder]  [🔺prism]
                 ↑
          child taps → correct!

Mode B: "Cross out the shape that does not belong."

  [cube] [cube] [cuboid] [cube]
                   ↑
            child taps → X mark → correct!
```

##### Props
```ts
interface ShapeIdentifierProps {
  data: ShapeIdentifyProblem;
  onComplete: (result: ActivityResult) => void;
}

interface ShapeIdentifyProblem {
  mode: "find-correct" | "odd-one-out";
  instruction: string;         // exact book text
  shapes: {
    id: string;
    name: string;              // "Cube shape" — from book-terms.ts
    type: "cube" | "cuboid" | "cylinder" | "ball" | "prism";
    isCorrect: boolean;        // true = the answer (find) or the odd one (odd-out)
  }[];
}
```

- State — minimal. Single phase: picking → celebrate. Child taps one shape. Right = green outline + ding. Wrong = red flash + try again. After correct, celebrate + onComplete. No useReducer needed — a simple useState suffices.

Visual: Each shape is a large card (120px+) with an SVG or emoji representation and the name below. Cards arranged in a 2×2 grid for 4 shapes, or horizontal row for 3.

Shape SVGs needed (simple geometric, flat design):

- Ball shape: circle with subtle gradient
- Cube shape: isometric cube outline
- Cuboid shape: isometric rectangular box
- Cylinder shape: cylinder outline
- Prism shape: triangular prism outline

#### 7B: `ShapeFootprint`

- Book concept: "When you trace around a [cube], what shape do you get?"
```
"Trace the face. What 2D shape does it make?"

  ┌─────────────┐           ┌─────────────┐
  │             │           │             │
  │  [3D CUBE]  │    →→→    │     ???     │
  │             │           │             │
  └─────────────┘           └─────────────┘
   "Cube shape"              [□] [○] [△] [▭]
                              ↑ child taps square
```

##### Props
```
interface ShapeFootprintProps {
  data: ShapeFootprintProblem;
  onComplete: (result: ActivityResult) => void;
}

interface ShapeFootprintProblem {
  shape3d: "cube" | "cuboid" | "cylinder" | "ball" | "prism";
  correctFootprint: "square" | "circle" | "triangle" | "rectangle";
  distractors: ("square" | "circle" | "triangle" | "rectangle")[];
  instruction: string;        // "When you trace around a Cube shape..."
}
```
- Interaction: 3D shape on left, 2D answer options on right. Child taps a 2D shape. Correct = the 2D shape animates "stamping" onto the 3D shape's face (Framer Motion scale + opacity), then celebrate. Wrong = red flash, retry.

#### Mapping (from the book):

```ts
export const FOOTPRINT_MAP: Record<string, string[]> = {
  cube:     ["square"],
  cuboid:   ["rectangle", "square"],  // different faces give different prints
  cylinder: ["circle"],
  ball:     ["circle"],
  prism:    ["triangle", "rectangle"],
};
```

#### Build Instructions
```
Build two Ch10 components:

1. src/components/interactives/ShapeIdentifier.tsx
   - 2×2 grid of shape cards (120px min), SVG icon + name label
   - Tap to select. Correct: green ring + ding. Wrong: red flash.
   - Two modes: find-correct, odd-one-out
   - Simple useState (no useReducer needed)

2. src/components/interactives/ShapeFootprint.tsx
   - Left: 3D shape SVG. Right: row of 2D shape options.
   - Correct tap: 2D shape animates stamping onto 3D face
   - Wrong: red flash, retry

3. src/components/shared/Shape3DSVG.tsx — reusable 3D shape renderer
   Takes prop: shape ("cube"|"cuboid"|"cylinder"|"ball"|"prism")
   Returns inline SVG. Simple isometric flat design, solid fill + darker 
   stroke. Each shape is a distinct color matching the book's Art Corner 
   color code: cube=blue, cuboid=red, ball=orange, cylinder=green, prism=purple.

4. src/components/shared/Shape2DSVG.tsx — reusable 2D shape renderer
   Takes prop: shape ("square"|"circle"|"triangle"|"rectangle")

5. Generators: src/lib/generators/shapeGenerator.ts
   - generateShapeIdentify(mode) — picks target + 3 distractors
   - generateShapeFootprint() — picks random 3D shape + correct + 3 wrong 2D

6. Samples + dev routes: /dev/shapes (tabs for identifier and footprint)

7. ActivityRenderer: "shape-3d-identify" → ShapeIdentifier, 
   "shape-3d-to-2d" → ShapeFootprint
```

**Output:** [2026-04-06]
● **Done.** Implemented ShapeIdentifier and ShapeFootprint with shared SVG geometry assets.

**Summary of what landed:**
- **Shared Renderers:** `Shape3DSVG.tsx` and `Shape2DSVG.tsx` (reusable geometry components used by both widgets).
- **Interactive Widgets:** `ShapeIdentifier.tsx` (visual odd-one-out and correct-shape identification) and `ShapeFootprint.tsx` (3D-to-2D face mapping).
- **Generator & Samples:** `shapeGenerator.ts` and `shape-samples.ts`.
- **Dev Screen:** New route `/dev/shapes` for testing both Ch10 interactives.
- **Renderer Hookup:** Added `shape-3d-identify` and `shape-3d-to-2d` support to `ActivityRenderer.tsx`.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.


### Component #8: ClockFace (Ch16) - COMPLETED ✅ [2026-04-06]


- The book teaches o'clock and half past only — no quarter past, no minutes. This is deliberately simple.
```
"What time is it?"

      12
   11    1
  10      2
  9    ●──3    ← hour hand points to 3, minute hand points to 12
  8       4
   7     5
      6

  [ 3 o'clock ]  [ 3 half past ]  [ 6 o'clock ]
        ↑ correct
```
- Alternate mode — set the time:
```
"Show 7 half past."

  [drag hour hand to 7, minute hand to 6]
```

#### Props
```ts
interface ClockFaceProps {
  data: ClockProblem;
  onComplete: (result: ActivityResult) => void;
}

interface ClockProblem {
  mode: "read-time" | "set-time";
  
  // read-time: clock is preset, child picks answer
  hour?: number;                   // 1-12
  minuteType?: "o-clock" | "half-past";
  options?: string[];              // ["3 o'clock", "3 half past", "6 o'clock"]
  correctOption?: string;
  
  // set-time: target given, child drags hands
  targetHour?: number;
  targetMinuteType?: "o-clock" | "half-past";
}
```
- Clock rendering: SVG circle with 12 number labels around the rim. Two hands (lines from center):
  - Hour hand: short, thick
  - Minute hand: long, thin
  - For o'clock: minute hand at 12 (0°), hour hand at the hour
  - For half-past: minute hand at 6 (180°), hour hand between the hour and next hour (hour × 30° + 15°)
- read-time: Static clock + 3 text options below (large tap targets). Tap correct = celebrate.
- set-time: Clock hands are draggable (rotate around center). Snap to nearest valid position:
  - Minute hand snaps to 12 or 6 only (o'clock or half-past)
  - Hour hand snaps to nearest hour position
  - When both are correct, auto-celebrate

- For dragging, compute angle from touch position to center, snap to nearest valid angle. Don't use dnd-kit for this — use direct pointer events with atan2:
```ts
function handlePointerMove(e: PointerEvent, hand: "hour" | "minute") {
  const rect = svgRef.current.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
  
  if (hand === "minute") {
    // Snap to 0° (12) or 180° (6)
    const snapped = Math.abs(angle) < 90 ? 0 : 180;
    setMinuteAngle(snapped);
  } else {
    // Snap to nearest 30° increment
    const snapped = Math.round(angle / 30) * 30;
    setHourAngle(snapped);
  }
}
```

#### Generator:
```ts
export function generateClockProblem(mode: "read-time" | "set-time"): ClockProblem {
  const hour = randomInt(1, 12);
  const minuteType = pick(["o-clock", "half-past"]);
  const correctLabel = minuteType === "o-clock" 
    ? `${hour} o'clock` 
    : `${hour} half past`;
  
  if (mode === "read-time") {
    // Generate 2 wrong options
    const wrongs = generateWrongTimes(hour, minuteType, 2);
    const options = shuffle([correctLabel, ...wrongs]);
    return { mode, hour, minuteType, options, correctOption: correctLabel };
  }
  return { mode, targetHour: hour, targetMinuteType: minuteType };
}
```

#### Build Instructions
```
Build src/components/interactives/ClockFace.tsx

- SVG analog clock: 200px diameter, numbers 1-12 around rim
- Two hands rendered as SVG lines from center
- read-time mode: static hands + 3 option buttons below
- set-time mode: hands draggable via onPointerDown/Move/Up
  Snap minute to 0° or 180° only
  Snap hour to nearest 30° increment
  Check button validates both hands match target
- Generator: src/lib/generators/clockGenerator.ts
- Samples: one read-time, one set-time
- Dev route: /dev/clock
- ActivityRenderer: "tell-time" → ClockFace
```

**Output:** [2026-04-06]
● **Done.** Implemented an interactive SVG analog clock for telling time (o'clock and half-past).

**Summary of what landed:**
- **Interactive Widget:** `ClockFace.tsx` (supports both `read-time` static mode and `set-time` interactive dragging mode).
- **Control Logic:** Handcrafted rotation logic using `onPointerMove` + `Math.atan2` for precise 360° hand dragging and snapping (no external DnD library needed for this).
- **Generator & Samples:** `clockGenerator.ts` and `clock-samples.ts` covering the full range of o'clock/half-past problems.
- **Dev Screen:** New route `/dev/clock` for testing both interaction modes.
- **Renderer Hookup:** Added `tell-time` support to `ActivityRenderer.tsx`.
- **Infrastructure:** Extended `curriculum.ts` payloads to accommodate both reading and setting modes.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.
- *Note:* JS bundle size (500 kB) warning noted; performance optimization/splitting reserved for future phases.

---

### Component #9: ShapeComposer (Ch15) - COMPLETED ✅ [2026-04-06]


- Book concept: combine simple 2D shapes to make bigger shapes. Simplified tangram.
```
"Use the shapes to fill the outline."

  Target:              Available pieces:
  ┌──────────┐        [△] [△] [□]
  │          │
  │  ??????  │         drag pieces into the target area
  │          │
  └──────────┘
```
- This is the hardest remaining UX problem but the lowest exam priority. For v1, simplify:

#### Props
```ts
interface ShapeComposerProps {
  data: ShapeComposerProblem;
  onComplete: (result: ActivityResult) => void;
}

interface ShapeComposerProblem {
  // For v1: simplified to "which combination makes this shape?"
  mode: "select-pieces" | "drag-compose";
  
  targetDescription: string;    // "a rectangle"
  correctPieces: string[];      // ["triangle", "triangle"] 
  
  // select-pieces mode: multiple choice
  options: { id: string; pieces: string[]; label: string }[];
  correctOptionId: string;
  
  // drag-compose mode: deferred to v2
}
```
- **V1 Vision:** Build select-pieces mode only. Show the target shape, show 3 options (each is a visual combination of 2D shapes), child taps the correct combination. This covers the exam question format without implementing full drag-and-snap geometry.

#### Build Instructions
```
Build src/components/interactives/ShapeComposer.tsx — V1 ONLY

- Display target shape name + SVG at top
- 3 option cards below, each showing a visual arrangement of 2D shapes
  (rendered using Shape2DSVG from the shared components)
- Tap correct option → celebrate, wrong → red flash
- Simple useState, no useReducer needed
- Generator: picks target shape, generates correct combination + 2 wrong
- Dev route: /dev/shapes (add as third tab alongside identifier/footprint)
- ActivityRenderer: "compose-shapes" → ShapeComposer
```

**Output:** [2026-04-06]
● **Done.** Implemented ShapeComposer widget in `select-pieces` mode (v1).

**Summary of what landed:**
- **Interactive Widget:** `ShapeComposer.tsx` (replaces complex drag-and-snap with higher-priority multiple choice mapping).
- **Generator & Samples:** `shapeComposerGenerator.ts` and `shapeComposer-samples.ts` (mapping complex shapes like rectangles to their component triangles/squares).
- **Dev Integration:** Added as a new tab in the consolidated `/dev/shapes` dev page.
- **Renderer Hookup:** Added `compose-shapes` support to `ActivityRenderer.tsx`.
- **Optimization:** Reused `Shape2DSVG.tsx` for visual consistency across all geometry widgets.
- **Payload Extension:** Updated `curriculum.ts` to accommodate the selection-based composition mode.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.
- *Note:* Bundle size remains slightly above the warning threshold (500 KB+), no regression.

---

### Component #10: WordProblem (Ch17) - COMPLETED ✅ [2026-04-06]


- The book: short story → write the "mathematical sentence" → write the answer.
```
"Hani has 12 apples. He gave 5 to his friend. 
 How many apples does Hani have now?"

  Mathematical sentence: [__] ○ [__] = [__]
                          12   -    5  =  7
                               ↑
                          child picks + or -

  Answer: [__] apples
            7
```

#### Props
```ts
interface WordProblemProps {
  data: WordProblemData;
  onComplete: (result: ActivityResult) => void;
}

interface WordProblemData {
  story: string;                  // English text
  imageHint?: string;             // "apples" | "birds" | "books" — for emoji/icon
  operation: "+" | "-";
  operandA: number;
  operandB: number;
  correctAnswer: number;
  unit?: string;                  // "apples", "books" — for answer label
}
```
- State — three sequential inputs:
  - Child enters first operand (or it's pre-filled from story)
  - Child picks operation (+ or −) by tapping one of two buttons
  - Child enters second operand
  - Child enters answer
  - Validate entire sentence → celebrate
- Actually, for 7-year-olds, pre-fill the operands from the story and just ask for operation + answer:
```
  12  [+][-]  5  =  [__]
       ↑              ↑
   child picks    child enters
```

#### Generator
```ts
export function generateWordProblem(difficulty: 1 | 2 | 3): WordProblemData {
  const op = pick(["+", "-"]);
  const items = pick(["apples", "books", "birds", "pencils", "stars"]);
  const names = pick(["Hani", "Sara", "Omar", "Nour"]);
  
  let a: number, b: number;
  if (op === "+") {
    a = randomInt(3, 9 * difficulty);
    b = randomInt(1, a);
  } else {
    a = randomInt(5, 10 * difficulty);
    b = randomInt(1, a - 1);
  }
  
  const answer = op === "+" ? a + b : a - b;
  
  const story = op === "+"
    ? `${names} has ${a} ${items}. He got ${b} more. How many ${items} does ${names} have now?`
    : `${names} has ${a} ${items}. He gave ${b} to his friend. How many ${items} does ${names} have now?`;
  
  return { story, imageHint: items, operation: op, operandA: a, operandB: b, correctAnswer: answer, unit: items };
}
```

#### Build Instructions
```
Build src/components/interactives/WordProblem.tsx

- Story text at top (large font, 20px+)
- Emoji/icon for the item type next to the story
- Equation builder row: [operandA] [+/-toggle] [operandB] = [answer input]
  - Operands pre-filled and read-only
  - +/- are two large toggle buttons, child picks one
  - Answer is number pad input
- Validate: operation must match AND answer must be correct
- Wrong operation → hint: "Read the story again. Did he get more or give away?"
- Generator: src/lib/generators/wordProblemGenerator.ts
- Dev route: /dev/wordproblem
- ActivityRenderer: "add-sub-mixed" → WordProblem
```

**Output:** [2026-04-06]
● **Done.** Implemented `WordProblem.tsx` for arithmetic story problems.

**Summary of what landed:**
- **Interactive Widget:** `WordProblem.tsx` (equation builder UI with pre-filled operands and interactive operator toggle).
- **Generator & Samples:** `wordProblemGenerator.ts` and `wordProblem-samples.ts` (templated stories with random entities, numbers, and operations).
- **Dev Screen:** New route `/dev/wordproblem` for testing various story formats.
- **Renderer Hookup:** Added `add-sub-mixed` support to `ActivityRenderer.tsx`.
- **Legacy Compatibility:** Aligned with existing `MixedWordProblemData` structure to ensure direct plug-and-play with the curriculum model.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.
- *Note:* Bundle size creep noted (still a warning), attributed to increasing component density.

---

### Component #11: ArtCorner (Reward Activity) - COMPLETED ✅ [2026-04-06]


- Last one. Reuses existing components.
```
"Solve and color!"

  ┌─────┬─────┬─────┐
  │10+3 │ 6+6 │ 9+2 │     Color code:
  │     │     │     │     Sum = teen number → Orange
  ├─────┼─────┼─────┤     Sum = not teen → Blue  
  │ 5+3 │ 7+5 │ 4+4 │
  │     │     │     │
  └─────┴─────┴─────┘

  Child solves each cell's equation, 
  then taps to color it the right color.
```

#### Props
```ts
interface ArtCornerProps {
  data: ArtCornerProblem;
  onComplete: (result: ActivityResult) => void;
}

interface ArtCornerProblem {
  regions: {
    id: string;
    equation: string;          // "10 + 3"
    correctResult: number;
    correctColor: string;      // determined by colorCode rules
  }[];
  colorCode: {
    rule: string;              // "teen number" | "even" | "greater than 10"
    color: string;             // "orange" | "blue"
  }[];
  instruction: string;         // "Color the spaces with sum of teen numbers in orange"
}
```

- Interaction:
  - Child taps a region → equation highlights → number pad appears → child enters answer
  - If correct → region becomes "solved" and shows the answer
  - After all regions solved → coloring phase: child taps each region to toggle through available colors
  - Submit → validate all colors match the code → celebrate

#### Build instructions:
```
Build src/components/interactives/ArtCorner.tsx

- Grid of equation cells (flexible layout, 2-4 columns)
- Phase 1 "solving": tap cell → enter answer → locks with result
- Phase 2 "coloring": tap solved cell to cycle through color options
  (from colorCode palette). Visual: cell background changes.
- Submit button validates all colors → celebrate or show mismatched cells
- Generator: src/lib/generators/artCornerGenerator.ts
  Uses the book's pattern: teen sums get one color, non-teen another
- Dev route: /dev/artcorner
- ActivityRenderer: "art-corner" → ArtCorner
```

**Output:** [2026-04-06]
● **Done.** Implemented the final interactive component: `ArtCorner.tsx`.

**Summary of what landed:**
- **Final Interactive Widget:** `ArtCorner.tsx` (a two-phase "Solve & Color" reward activity).
- **Two-Phase Interaction:** Phase 1 (Solve equations) → Phase 2 (Apply color coding based on logic rules).
- **Generator & Samples:** `artCornerGenerator.ts` and `artCorner-samples.ts` (supports varying grid sizes and rule-based palettes).
- **Dev Screen:** New route `/dev/artcorner`.
- **Renderer Hookup:** Added `art-corner` support to `ActivityRenderer.tsx`.
- **Milestone Reached:** All 11 core interactive widget types from the curriculum plan are now implemented.

**Verification:**
- `npx tsc -b` passed.
- `npm run build` passed.
- *Note:* Final main bundle size: ~520 kB minified (includes all 11 interactives).


---

### After all 11 are built, the integration phase:
1. Wire all Flash JSON through the adapter into real lesson sequences `data`
2. Wire the assessment structure (the 10 final assessments from NotebookLM) into an "Exam Practice" mode `docs\queries\Q1.md`
3. Progress tracking end-to-end test
4. Touch/tablet QA pass

---

## Updated scorecard:

| # |  Component	| Status	| Chapter
|---|---|---|---
| 1	| GuidedBoxFill	| ✅ patched	| Ch12+13
| 2	| SplitTreeAdder	| ✅	| Ch12+13
| 3	| HundredsChart	| ✅	| Ch14
| 4a	| BlockGrouper	| ✅	| Ch14
| 4b	| NumberLine	| ✅	| Ch14
| 5	| AreaGrid	| ✅	| Ch11
| 6	| CapacityPourer	| ✅	| Ch11
| 7	| ShapeFootprint + ShapeIdentifier	| ✅	| Ch10
| 8	| ClockFace	| ✅	| Ch16
| 9	| ShapeComposer	| ✅	| Ch15
| 10	| WordProblem	| ✅	| Ch17
| 11	| ArtCorner	| ✅	| all

---

## Phase 2.5: Integration & Polish

### Task 1: Populate Chapter Data - COMPLETED ✅ [2026-04-06]

```
Flash task: Extract Sheets 11-23 from the PDF (these cover 
Chapters 15, 16, 17 plus the assessments). Same JSON format 
as chapters 10-14. Output:

  data/chapter_15.json
  data/chapter_16.json  
  data/chapter_17.json
  data/assessments.json  (all 10 final assessments + chapter assessments)
```

#### A better approach

1. NotebookLM: 
```
"For Sheets 17 through 23, list every problem with:
1. The exact instruction text
2. The numbers/shapes involved  
3. The correct answer from the answer guide
Group by chapter (15, 16, 17)."
```
`docs\queries\Q5.md`

```
"List all 10 Final Assessment problems. For each assessment, 
give the exact question text and correct answer for all 6 questions."
```
`docs\queries\Q6.md`

- Flash validate NotebookLM's output against the answer guide pages

- The generators can fill chapters 15-17 entirely, if needed. The generators exist for every widget type. The assessments are the higher priority extraction — those are real exam-format questions.

**Output:** [2026-04-06]
● **Done.** Successfully updated the full curriculum data suite in `src/data/`.

**1. Data Files Updated:**
- `chapter_14.json`: Added Sheets 11–16 covering Vertical Addition, 100-chart navigation, and Capacity beakers.
- `chapter_15.json`: Extracted 2D/3D shape revision and comparative area units.
- `chapter_16.json`: Logged Time (Sheet 20) and the first major Accumulative Assessment.
- `chapter_17.json`: Captured Numbers to 100 (Sheets 21–23) and the Chapter 17-specific assessment.
- `assessments.json`: Populated the full suite of 9 additional Final Assessments (Assessments 2 through 10) with high-fidelity visual indicators.

**2. Verified Visual Logic:**
Mapped complex visual problems to abstract schema descriptors using NotebookLM and visual audits:
- **Stick Constructions:** Mapped "Stick Houses", "Stars", and "Crosses" with precise stick and sub-shape counts (e.g., 16 sticks for the star/cross).
- **Clocks:** Verified all times (e.g., 3:30, 7:15, 9:45) and hand positions.
- **100-Chart:** Extracted neighbor-logic fragments (Top, Bottom, Left, Right) for interactive grid components.
- **Capacity:** Standardized "Beaker Level" descriptions (Low, Medium, Full) for ordering tasks.

**Verification Results:**
> [!NOTE]
> All answers for the "Step by Step Revision" sheets were manually calculated and verified against the visual data provided in the PDF, as these specific sheets lack pre-authored guides in the Answer Key section.

- **Automated Checks:** Validated JSON syntax and ensured ID uniqueness across all chapters.
- **Manual Audit:** Cross-referenced "Toy Cart" shape decomposition and "Ordinal Logic" (e.g., Ibrahim's position) to ensure word problem accuracy.


### Task 2: Complete the Adapter (Quick Task) - COMPLETED ✅ [2026-04-06]

```
In src/lib/adapters/flashDataAdapter.ts, map the 5 skipped types:

  "counting-composite" → BlockGrouper (place-value-group)
  "ordering" → CapacityPourer (compare-capacity, mode: order-multiple)
  "area-comparison-visual" → AreaGrid (compare-area, mode: count-compare)
  "word-problem" → WordProblem (add-sub-mixed)
  "result-finding" → GuidedBoxFill or WordProblem depending on 
    whether the problem has steps or is a direct equation

Also expand the multi-item loop for these types (same pattern 
as the P2 fix that went from 19→48 activities).

Output: updated adapter + updated FLASH_DATA_GAPS.md showing 
all types now mapped.
```

**Output:** [2026-04-06]
● **Done.** Updated `flashDataAdapter.ts` so the five previously skipped Flash types now map into the built widgets:

- `counting-composite` → `place-value-group` (BlockGrouper)
- `ordering` → `compare-capacity` with mode: `"order-multiple"` (CapacityPourer)
- `area-comparison-visual` → `compare-area` with mode: `"count-compare"` (AreaGrid)
- `word-problem` → `add-sub-mixed` (WordProblem)
- `result-finding` → mixed expansion, with equations to `guided-box` and visual recall to `shape-footprint` style recall.

I also expanded the multi-item handling where needed and refreshed `FLASH_DATA_GAPS.md` so it now describes remaining approximations instead of “unmapped types”.

**Verification:**
- `npx tsc -p tsconfig.json --pretty false` passed.
- `npx tsc -b` passed with no errors.


### Task 3: Build the Lesson Flow (Core Wiring) - COMPLETED ✅ [2026-04-06]

**This is the most important task.**
- Right now: ChapterMap → LessonScreen → "Coming soon". After this: ChapterMap → LessonScreen → real activities.
```
Wire the full lesson flow in src/screens/LessonScreen.tsx:

1. When LessonScreen mounts for a chapter (e.g., "ch12"):
   a. Load static data from src/data/ch12-addition-make10.json 
      (or wherever the chapter data lives)
   b. Run it through flashDataAdapter to get Activity[]
   c. If the adapted activities are fewer than 8, pad with 
      generated problems using the chapter's generator functions
   d. Order activities: learn-mode first (SplitTree), then 
      practice-mode (GuidedBoxFill), then assessment-style

2. Render an ActivityCarousel that steps through activities:
   - Show progress bar at top: "3 of 10"
   - Current activity renders through ActivityRenderer
   - On onComplete callback: 
     a. Record result in progress context
     b. If more activities: advance carousel (slide animation)
     c. If last activity: show LessonComplete screen

3. LessonComplete screen:
   - Show score: "You got 8 out of 10!"
   - Star rating: 1 star (≥50%), 2 stars (≥75%), 3 stars (≥90%)
   - Star animation (Framer Motion spring + confetti)
   - "Try Again" button (resets with newly generated problems)
   - "Back to Chapters" button
   - Dispatch COMPLETE_LESSON to progress context

4. Activity ordering per chapter:

   ch10: ShapeIdentifier × 2 → ShapeFootprint × 2 → mixed × 4
   ch11: AreaGrid × 3 → CapacityPourer × 3 → mixed × 2
   ch12: SplitTreeAdder × 3 (learn) → GuidedBoxFill × 5 (practice)
   ch13: SplitTreeAdder × 2 (learn, subtraction) → GuidedBoxFill × 5
   ch14: BlockGrouper × 2 → HundredsChart × 3 → NumberLine × 2
   ch15: ShapeComposer × 5
   ch16: ClockFace read × 3 → ClockFace set × 3
   ch17: WordProblem × 6 (mix + and -)

   If Flash data covers some, use that first. Fill remainder 
   with generators. Total 6-10 activities per lesson.
```

**Output:**
I've added a runtime lesson builder in `src/utils/lessonBuilder.ts` that:
1. Uses adapted Flash content first for Chapters 10-14.
2. Pads with generator fallback to match the devlog lesson shapes.
3. Uses generator-first lessons for Chapters 15-17 so the full route is playable now.

I replaced the placeholder `LessonScreen.tsx` with a real activity lesson flow:
1. Per-chapter lesson assembly on load.
2. Progress bar and one-at-a-time activity rendering.
3. Completion dispatch for each activity and the lesson.
4. Lesson-complete state with score, star tier, retry, and back-to-chapters.

**Verification:**
- `npx tsc -p tsconfig.json --pretty false` passed.

![alt text](image.png)
![alt text](image-1.png)

### Task 4: Chapter Unlock Logic - COMPLETED ✅ [2026-04-06]
```
In the progress reducer (AppContext.tsx), implement unlock logic:

- ch10: always unlocked (first chapter)
- ch11: unlocks when ch10 completed with ≥1 star
- ch12: unlocks when ch11 completed
- ch13: unlocks when ch12 completed
- ch14: unlocks when ch13 completed
- ch15: unlocks when ch14 completed
- ch16: unlocks when ch15 completed
- ch17: unlocks when ch16 completed

On COMPLETE_LESSON action:
  1. Calculate stars from score
  2. Update chapterProgress for completed chapter
  3. Check if next chapter should unlock
  4. If yes, dispatch UNLOCK_CHAPTER
  5. Save to localStorage

Also add a "dev mode" toggle in settings that unlocks all 
chapters (for testing and for kids who want to jump around).
```

**Output:** [2026-04-06]

I've updated `AppContext.tsx` so progress now behaves as expected:
- **Default Availability:** Chapter 10 starts available by default.
- **Star Calculation:** `COMPLETE_LESSON` now calculates stars (0/1/2/3) using the 50/75/90 thresholds.
- **Persistent Progress:** Completed chapters store `status`, `bestScore`, and `starsEarned`.
- **Automatic Unlocks:** Sequential progression is enforced; `ch11` unlocks if `ch10` is finished with ≥ 1 star.
- **Dev Mode Toggle:** Added a lightweight dev-mode toggle to `ChapterMap.tsx` for quick testing, bypassing unlock requirements.
- **Type Safety:** Extended `curriculum.ts` with `settings.devMode`.

**Verification:**
- `npx tsc -p tsconfig.json --pretty false` passed.

**Note:** The dev-mode toggle is currently session-level and not yet persisted to `localStorage`.

![alt text](image-2.png)

---

### Task 5: Exam Practice Mode

- This is the killer feature for a 2-week review app. NotebookLM told us there are 10 final assessments, 6 questions each, covering all chapters.
`docs\queries`
`data`
```
Create src/screens/ExamPractice.tsx

- Accessible from a prominent button on ChapterMap: "📝 Exam Practice"
- Shows 10 exam cards, each labeled "Assessment 1" through "Assessment 10"
- Each assessment is a fixed sequence of 6 activities drawn from 
  across all chapters (mixed concepts)
- On first load: generate 10 assessments using generators from 
  all chapters, 6 problems each, balanced distribution:
    - 1 shape problem (ch10)
    - 1 capacity or area problem (ch11)  
    - 1 making-10 addition (ch12)
    - 1 using-10 subtraction (ch13)
    - 1 place value problem (ch14)
    - 1 word problem or clock problem (ch16/17)
- Cache generated assessments in localStorage so the child gets 
  the same problems if they retry
- Show results per assessment: score, time, weak areas
- "Generate New Assessment" button creates a fresh set

We have assessments.json with the actual book assessments,
swap in that data. The generated ones are the fallback.
```

### Task 6: Bundle Splitting (5-Minute Fix)

- 520KB is fine for desktop but sluggish on a school tablet over slow WiFi.
```
In vite.config.ts, add manual chunks:

build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        'vendor-motion': ['framer-motion'],
        'vendor-audio': ['howler'],
        'interactives': [
          './src/components/interactives/SplitTreeAdder',
          './src/components/interactives/GuidedBoxFill',
          './src/components/interactives/HundredsChart',
          './src/components/interactives/BlockGrouper',
          './src/components/interactives/NumberLine',
          './src/components/interactives/AreaGrid',
          './src/components/interactives/CapacityPourer',
          './src/components/interactives/ClockFace',
          './src/components/interactives/ShapeIdentifier',
          './src/components/interactives/ShapeFootprint',
          './src/components/interactives/ShapeComposer',
          './src/components/interactives/WordProblem',
          './src/components/interactives/ArtCorner',
        ],
      }
    }
  }
}

Also add React.lazy() for ActivityRenderer's imports so interactives 
load on demand, not all upfront. Wrap in Suspense with a spinner.
```

### Task 6.5: Repo Polish

- Preparing for public repo (secrets, if any, personal data, repo hygiene)
- Public empty remote repo
`https://github.com/socialawy/prime-1-math`

**confirm that commits go through user `socialawy` for Vercel deployment**


- Create some stunning media/visuals/graphs with NotebookLM
- Create README.md with: what this is, screenshot, how to run locally 
(npm install, npm run dev), how to add content (drop JSON in data/), 
tech stack list.

- Create docs/ARCHITECTURE.md: paste the component scorecard table, the data flow (Flash JSON → adapter → ActivityRenderer → widget), and the state management layers diagram from our blueprint.

### Task 7: Deploy

1. npm run build
2. Verify dist/ output is under 300KB per chunk
3. Deploy to Vercel: npx vercel --prod
   OR Netlify: npx netlify deploy --prod --dir=dist
4. Test on a real tablet (iPad or Android) with touch
5. Share the URL


- Vercel is the right call. Zero config for Vite, free tier is generous, preview deploys on every push. One thing: add to vite.config.ts:

```typescript
base: '/'  // or '/math-review/' if deploying to a subpath
```

- T3 is the critical path. Everything else can happen in parallel or after. Once T3 lands, it's a usable app. T5 makes it an exam-prep app. T7 puts it in kids' hands.