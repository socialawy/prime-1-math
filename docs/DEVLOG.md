# DEVLOG (2026-04-05)

## Phase 0: Data

### Task-1:
- Notebook created with Book 2 `local-files\Math-Grade-Primary-01-184-252.pdf` and 3 `local-files\Math-Grade-Primary-01-253-288.pdf`

### Task-2:
- Intial BLUEPRINT.md nad local git

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

### Task 2: (x) 12&13 uploaded
Create Book 1 notebook. Upload only Ch12+13 splits first (highest exam weight). It becomes the oracle you query during dev if a terminology question comes up.

## Once Track B for data and C scaffold are ready:

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