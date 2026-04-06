# Architecture

## What This Repo Does

`prime-1-math` is a curriculum-driven React app that converts textbook extraction data into interactive math activities, lesson flows, and mixed exam-practice sessions.

## Component Scorecard

| # | Component | Status | Chapter |
|---|---|---|---|
| 1 | GuidedBoxFill | done | Ch12+13 |
| 2 | SplitTreeAdder | done | Ch12+13 |
| 3 | HundredsChart | done | Ch14 |
| 4a | BlockGrouper | done | Ch14 |
| 4b | NumberLine | done | Ch14 |
| 5 | AreaGrid | done | Ch11 |
| 6 | CapacityPourer | done | Ch11 |
| 7 | ShapeFootprint + ShapeIdentifier | done | Ch10 |
| 8 | ClockFace | done | Ch16 |
| 9 | ShapeComposer | done | Ch15 |
| 10 | WordProblem | done | Ch17 |
| 11 | ArtCorner | done | all |

## Data Flow

```text
Flash / NotebookLM JSON
        ->
src/lib/adapters/flashDataAdapter.ts
        ->
runtime builders
  - src/lib/lessonBuilder.ts
  - src/lib/examBuilder.ts
        ->
src/components/ActivityRenderer.tsx
        ->
interactive widget component
        ->
ActivityResult
        ->
src/context/AppContext.tsx
        ->
src/lib/storage.ts
```

## State Layers

```text
AppProvider
  - student progress
  - chapter unlock state
  - stars
  - settings
  - audio stubs

Screen layer
  - LessonScreen: current activity index, per-run lesson results
  - ExamPractice: active assessment, current item index, per-run exam results

Renderer layer
  - ActivityRenderer: conceptKey -> lazy-loaded widget

Widget layer
  - each interactive owns its local answer / animation / completion state
```

## Key Files

- `src/context/AppContext.tsx`
  Progress reducer, unlock logic, settings, persistence boundary.
- `src/lib/adapters/flashDataAdapter.ts`
  Thin translation layer from extracted JSON into app activity types.
- `src/lib/lessonBuilder.ts`
  Chapter lesson assembly from adapted Flash data plus generator fallback.
- `src/lib/examBuilder.ts`
  Assessment assembly and local caching for exam practice.
- `src/components/ActivityRenderer.tsx`
  Central concept router into the interactive widget set.
- `src/screens/LessonScreen.tsx`
  Main lesson flow.
- `src/screens/ExamPractice.tsx`
  Mixed assessment flow.

## Routing

- `/` splash screen
- `/chapters` chapter map
- `/lesson/:chapterId` lesson flow
- `/exam-practice` exam practice mode
- `/dev/*` isolated widget testing routes

## Adding a New Interactive Widget

To add a new math interactive to the platform, follow this checklist:

1. **Schema Check**: Define the data shape in `src/types/curriculum.ts`.
2. **Component Creation**: Create a new file in `src/components/interactives/`. 
   - Use `Framer Motion` for animations.
   - Ensure the component takes `data` and `onComplete` props.
3. **Renderer Registration**: Update `src/components/ActivityRenderer.tsx`:
   - Add a `lazy(() => import(...))` statement.
   - Add a `case` in the `switch` statement matching the `conceptKey`.
4. **Generator (Optional)**: If the widget is for a placeholder chapter, add a corresponding generator in `src/utils/generators/`.

---

## Technical Debt & Future Paths

- **Audio Implementation**: The `useAudio` hook in `AppContext` is currently a stub for Framer Motion SFX. Full VO implementation for Arabic instructional text is the next logical step.
- **Advanced State Persistence**: Migrate `localStorage` to a lightweight `IndexedDB` wrapper if the assessment cache grows significantly (>5MB).
- **Tablet Optimization**: Further CSS-level touch-area refinements for physical devices with lower DPI.
