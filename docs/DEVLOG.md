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

## Phase 2: GuidedBoxFill Implementation

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
Read the 5 JSON files Flash created in data/chapter_10.json through 
data/chapter_14.json. Compare their shape to our GuidedBoxProblem 
interface in src/types/curriculum.ts. 

Create src/lib/adapters/flashDataAdapter.ts that maps Flash's format 
into our app's types. Don't refactor Flash's files — write a thin 
translation layer. Log any fields that don't map cleanly to a 
FLASH_DATA_GAPS.md file so we know what to fix later.
```

### Component #2: SplitTreeAdder

-