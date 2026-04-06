# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
[1.2.0]: https://github.com/socialawy/prime-1-math/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/socialawy/prime-1-math/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/socialawy/prime-1-math/releases/tag/v1.0.0
