# Flash Data → App Types: Gaps & Unmapped Fields

Adapter: `src/lib/adapters/flashDataAdapter.ts`
Source files: `data/chapter_10.json` – `data/chapter_14.json`

---

## 1. Problem types with NO adapter (skipped entirely)

| Flash type | Chapter | Why skipped |
|---|---|---|
| `counting-composite` | Ch10 | No app type. Requires counting 3D shapes in a composite image (e.g., "a tower made of cubes"). Needs a new component or image-based quiz. |
| `ordering` | Ch11 | `CapacityData` supports `"order"` question type, but Flash data uses relative fill levels (`high`/`medium`/`low`) instead of numeric `capacityCups`. No numeric values to map. |
| `area-comparison-visual` | Ch11 | Visual-only comparison (shapes with `size: "small"/"large"`). No grid, no unit counts. Needs either numeric data or a new visual-comparison component. |
| `word-problem` | Ch11, Ch12, Ch14 | Three different shapes: character-based comparison (Ch11), additive (Ch12 `initial`+`added`), subtractive (Ch14 `initial`-`removed`). `MixedWordProblemData` expects `storyAr`/`storyEn` strings — Flash data uses structured fields instead. |
| `result-finding` | Ch13 | Mixed-type items array — includes both equations AND visual-recall ("Which shape did we trace?"). Can't map to a single activity type. |

## 2. Fields mapped with data loss

| Field | Where | What's lost |
|---|---|---|
| `context` (e.g., `"cheese-wedge"`, `"tennis-ball"`) | Ch10 all problems | Flash uses `imageType` + `context` for specific real-world illustrations. We only map `imageType` (the abstract shape). The kid-friendly object context is dropped. |
| `imageValue` | Ch10 `multiple-choice-visual` | Target has both `imageType` and `imageValue` (e.g., `"triangular-prism"`). We only keep `imageType`. |
| `sheet`, `page`, `verificationPage` | All | Workbook reference metadata. Not needed at runtime but useful for verification. Dropped silently. |
| `assessment` | Ch10, Ch12, Ch13 | Marks whether a problem is from the assessment section vs. regular sheets. Could be used for difficulty/weighting. Currently ignored. |
| `verification` | Ch11 | Textual reference to answer guide page. Dropped. |

## 3. Structural mismatches (adapted with caveats)

### Ch11 `area-grid-counting` → `AreaGridData`
- Flash has: shape name (`"F-like"`) + total unit count (`16`)
- App expects: `gridRows`, `gridCols`, `shapeA[]`, `shapeB[]` (actual cell coordinates)
- Adapter sets: `gridRows: 0, gridCols: 0, shapeA: [], shapeB: []`
- **Action needed:** Either hand-author the grid cell arrays for each shape, or build a "count-only" mode in the AreaGrid component that just asks "how many units?" without rendering a clickable grid.

### Ch12 `split-tree-addition` → `GuidedBoxProblem`
- Flash has: descriptive steps (`"9 needs 1 more to make 10"`, `"Split 3 into 1 and 2"`)
- App expects: templated steps with `{0}` blanks
- Adapter **recomputes** the split from the equation rather than parsing Flash step text. This means the Flash `steps` array is ignored and the adapter's math must be correct.
- **Risk:** If the textbook uses a non-standard split (e.g., splitting the larger number), the adapter's assumption ("split the smaller") could produce different steps than the book. The Flash data for `5 + 8` splits the 5 (not the 8), confirming the book sometimes splits the number that's farther from 10.

### Ch13 `split-tree-subtraction` → `GuidedBoxProblem`
- Same recomputation issue. Flash steps use a different strategy: "Split 14 into 10 and 4" then "Subtract 8 from 10". Adapter uses the DEVLOG's strategy: "Split the subtrahend to drop to 10 first".
- **These are different pedagogical approaches.** The Flash data matches the book's method (decompose the minuend). The adapter's output matches the DEVLOG's method (decompose the subtrahend).
- **Action needed:** Decide which method to use and align adapter + component. The book's method may be what kids see on exams.

### Ch12/13 `fill-in-the-blanks` → `GuidedBoxProblem`
- Flash has: simple equations with one blank (`"7 + __ = 10"`)
- Adapter creates a single-step GuidedBoxProblem (1 blank, no progressive disclosure)
- Works, but loses the "drill sheet" feel. These are rapid-fire, not guided.
- **Action needed:** Consider a simpler `EquationDrill` component for these.

### Ch10 `matching` → `ShapeIdentifyData`
- Flash has: 5 shapes matched to 5 names with explicit pairs
- Adapter takes only the first pair and creates a single MCQ
- **Lossy:** 4 out of 5 pairs are dropped. Needs a drag-to-match component or loop to create 5 activities.

### Multi-item problems (most types)
- Flash problems often contain multiple items (sub-questions) in one object
- Adapter currently takes only the **first item** from each problem
- **Action needed:** Expand adapter to emit one Activity per sub-item (loop over `items[]`), giving us 3-5x more activities from the same data.

## 4. Type system gap

`GuidedBoxProblem` is not part of the `ActivityData` union type. The adapter casts it via `as unknown as Activity["data"]`. To fix:
- Add `GuidedBoxProblem` to the `ActivityData` union in `src/types/curriculum.ts`
- Or create a separate routing path for guided-box activities

## 5. Missing chapters

Ch15 (Making Shapes), Ch16 (Time), Ch17 (Addition and Subtraction) have no JSON files yet. Presumably pending extraction from Book 1 via NotebookLM.
