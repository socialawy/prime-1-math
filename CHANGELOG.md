## [1.4.0] - 2026-04-14

### Added
- **Mascot Integration**: Introduced a lively mascot character into the Splash and Lesson results screens.
- **Unified Asset System**: Merged legacy emoji maps and image manifests into a single `ASSET_MAP` in `assetManifest.ts` for unified context rendering.
- **New Component**: Added `MascotImg` for reusable, pose-aware mascot rendering.

### Changed
- **Visual Upgrades**: Upgraded all container and shape assets to `.webp` format for better performance.
- **Asset Rendering**: Refactored `AssetIcon` to use a preferred-image, fallback-emoji strategy.
- **Smart Asset Resolution**: `resolveAsset()` now supports substring matching (e.g., "gift box" matches "gift").

### Fixed
- **Critical Logic**: Fixed shape fallback bias, clock phrasing ("half past"), and biased shuffle distributions.
- **Curriculum Bounds**: Capped operand generation to the Primary-1 limit (sums within 20).
- **Ambiguity Fix**: Resolved conflicts in footprint matching where shared shapes (rectangles) caused false negatives.
- **Efficiency**: Implemented caching for expensive generator loops in `lessonBuilder.ts`.

## [1.3.0] - 2026-04-07

### Added
- **Curriculum Completion:** Fully integrated Flash data for Chapters 15, 16, and 17 (Batches 5-6).
- **New Activity Adapters:** Handlers for `ClockRead`, `NumberComparison`, `MatchingTo100`, `GridFragmentFill`, and `CapacityOrdering` (Batch 7).

### Changed
- **Mobile UX Optimization:** Successfully refactored `SplashScreen.tsx` and `ChapterMap.tsx` to use `min-h-dvh` to prevent layout clipping (Batch 1).
- **Header Layout:** Fixed `ChapterMap.tsx` header to wrap on mobile devices, preventing button overlap.
- **Visual Standards:** Transitioned all star rendering to Unicode character glyphs across the map and lesson screens.

### Fixed
- **Content Integrity:** Resolved issues with empty/duplicated questions in Chapter 10 via generated set standardization (Batch 4).
- **Session Logic:** Implemented same-session activity deduplication in `lessonBuilder.ts` (Batch 8).
- **Navigation:** Forced scroll-to-top (`window.scrollTo(0,0)`) on lesson/exam transitions to ensure completion cards are visible.
- **Clock Filtering:** Automatically filtered non-standard times (:15/:45) from Chapter 16 data.

### Removed
- Removed legacy/dead file `LessonScreen.next.tsx`.

## [1.2.0] - 2026-04-06

### Added
- **Educational Resources:**
  - Added [STUDY-GUIDE.md](docs/STUDY-GUIDE.md) - A comprehensive primary math study guide for students and teachers.
  - Added [Infograph.jpg](docs/Infograph.jpg) - Visual curriculum overview.
  - Added [prime1-logo.webp](docs/prime1-logo.webp) - Official project branding.
- **"Golden Repo" Standards:** 
  - Added `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `LICENSE`.
- **Exam Practice Mode:** Mixed assessment logic, caching in `localStorage`, and real data mapping from `assessments.json`.

### Changed
- **Optimization:** Implemented bundle splitting and lazy loading for interactive widgets to support low-resource hardware.
- **Branding:** Updated `README.md` with new centralized branding and status badges.

## [1.1.0] - 2026-04-06

### Added
- **Interactive Widgets:** `ClockFace`, `ShapeComposer`, `WordProblem`, and `ArtCorner`.
- **Lesson Flow:** Multi-activity lesson runner with feedback states and star-tier scoring.
- **Chapter Map:** Visual progression system with unlock logic.

## [1.0.0] - 2026-04-05

### Added
- **Core Engine:** React 19 + Vite 8 foundation.
- **Curriculum Base:** Chapters 10–14 interactive adapters and initial data extraction.
- **Activity Renderer:** Dynamic routing for interactive components.
- **Initial Data:** Extracted curriculum JSON for early chapters.

---
[1.4.0]: https://github.com/socialawy/prime-1-math/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/socialawy/prime-1-math/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/socialawy/prime-1-math/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/socialawy/prime-1-math/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/socialawy/prime-1-math/releases/tag/v1.0.0
