# Flash Data -> App Types: Remaining Caveats

Adapter: `src/lib/adapters/flashDataAdapter.ts`
Source files: `data/chapter_10.json` through `data/chapter_14.json`

All known Flash problem types from Chapters 10-14 now have adapter coverage. The remaining notes are about approximation and data loss, not missing mappings.

## Mapped with approximation

| Flash type | Current app mapping | Caveat |
|---|---|---|
| `counting-composite` | `place-value-group` (`BlockGrouper`) | One composite image is expanded into one count-only activity per non-zero shape count. The app keeps the counts but does not render the original mixed 3D tower image. |
| `ordering` | `compare-capacity` (`CapacityPourer`, `mode: "order-multiple"`) | Flash stores relative fill words like `high` and `low`, not numeric cup values, so the adapter infers small ordinal capacities. The workbook prompt is often "most to least"; the current widget uses least-to-most ordering, so the adapter normalizes into widget order. |
| `area-comparison-visual` | `compare-area` (`AreaGrid`, `mode: "count-compare"`) | Flash gives relative size words like `small` and `large`, not square counts. The adapter converts those into ordinal unit counts and emits adjacent pair comparisons instead of one full ordering task. |
| `word-problem` | `add-sub-mixed` (`WordProblem`) | Structured Flash fields are flattened into one story string. The Chapter 11 "who wins?" comparison is normalized into a subtraction question asking "how many more?" so it fits the numeric widget. |
| `result-finding` | mixed expansion | Direct equations become one-step guided-box activities. Visual-recall items are adapted into `shape-3d-to-2d` recall prompts with generated footprint distractors. |

## Fields still dropped or simplified

| Field | Where | What happens now |
|---|---|---|
| `sheet`, `page`, `verificationPage`, `assessment` | All chapters | Still ignored at runtime. They remain available in the source JSON if we want lesson ordering or exam weighting later. |
| `context` / `imageValue` | Ch10 visuals | `contextHint` keeps some object flavor text, but the renderer still focuses on abstract shape categories rather than exact workbook art. |
| visual coordinates | Ch11 area tasks | `AreaGrid` count-compare mode works from numeric counts only. Real cell geometry is still absent from Flash. |

## Pedagogy alignment risks

- `split-tree-addition` and `split-tree-subtraction` are still recomputed from the equation instead of parsed from the Flash step text. That keeps the adapter stable, but it can drift from the exact textbook teaching sequence if the workbook chooses a different split strategy.
- `result-finding` visual recall uses generated distractors because Flash does not provide options for those items.

## Temporary workspace note

- A temporary file `src/lib/adapters/flashDataAdapter.next.ts` may still be present if the sandbox blocks deletion. Its content matches the main adapter and can be removed later without behavior change.
