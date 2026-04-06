# ROADMAP-HORIZONS.md

## Horizon 1: Exam-Ready (Next 3 Days)

- Goal: Kids can use this productively for exam review.
```
Day 1:
  - Batch 1 bug fixes (P0-P3, stars, dead file) → deploy
  - Wire Ch15-17 Flash data + fix Ch14 adapter gaps
  - Add session dedup to lessonBuilder
  - Emoji upgrade pass across all widgets

Day 2:
  - Expand generator pools (ShapeComposer, WordProblem)
  - Add difficulty curve to lessonBuilder
  - Wire ArtCorner as reward activity per chapter
  - Source or generate mascot SVG (1 character, 4 poses)
  - Deploy and real-device test with an actual child

Day 3:
  - Fix anything the child-test reveals
  - Polish exam practice mode with real assessment data
  - Final deploy
```

## Horizon 2: Rich Experience (Next 2 Weeks)

- Goal: The app feels like it belongs next to the textbook.
```
- Illustrated SVG asset set for all 3D/2D shapes
- Chapter-themed backgrounds (colors already in chapter data)
- Mascot speech bubbles for instructions
- Sound effects (correct/wrong/celebrate)
- YouTube playlist integration (help button → relevant video)
- Progress celebration screens between chapters
- Parent dashboard (PIN-protected stats view)
- Adaptive difficulty (track error rate, auto-adjust)
```

## Horizon 3: Platform (Post-Exams)

- Goal: Reusable for other terms, other grades, other subjects.
```
- CMS: Admin tool to author activities without code
  (JSON editor with visual preview)
- Multi-term support: Term 1 content as a second "campaign"
- Grade 2 expansion: Same widget library, new content
- Offline PWA: Service worker for classroom use without WiFi
- Analytics: Which concepts do kids struggle with most?
- Arabic-medium version: Same engine, Arabic content for 
  government schools
- Open-source release: Engine + empty content template
```

## Architecture Notes for Future Contributors

- The codebase is well-structured for this. Key decisions that enable the roadmap:
**What's right:**
- ActivityRenderer switch pattern makes adding widgets trivial
- Generator + Flash adapter dual-source means content can come from anywhere
- Types are strict — new contributors get compiler errors, not runtime bugs
- Bundle splitting already done — adding assets won't bloat initial load

**What needs attention:**
- book-terms.ts should become the single source for all display strings (some are still hardcoded in generators)
- The adapter's adaptProblem function is a growing switch statement — consider a registry pattern if it exceeds 15 types
- Visual assets need a manifest system: src/assets/manifest.ts mapping contextHint → asset path, so components don't each solve this differently
- Testing: zero tests currently. For Horizon 2+, add Vitest snapshot tests for generators (ensure they produce valid data) and Playwright for critical user flows

**The asset manifest idea specifically:**
```ts
// src/assets/manifest.ts
export const ASSET_MAP: Record<string, { emoji: string; svg?: string; photo?: string }> = {
  "apple":       { emoji: "🍎", svg: "/assets/items/apple.svg" },
  "gift-box":    { emoji: "🎁", svg: "/assets/items/giftbox.svg" },
  "tennis-ball": { emoji: "🎾" },
  "cheese-wedge":{ emoji: "🧀" },
  "juice-box":   { emoji: "🧃" },
  "cup":         { emoji: "🥤" },
  "star":        { emoji: "⭐" },
  "bird":        { emoji: "🐦" },
  "pencil":      { emoji: "✏️" },
  "book":        { emoji: "📚" },
  // 3D shapes
  "cube":        { emoji: "🧊", svg: "/assets/shapes/cube.svg" },
  "ball":        { emoji: "⚽", svg: "/assets/shapes/ball.svg" },
  "cylinder":    { emoji: "🥫", svg: "/assets/shapes/cylinder.svg" },
  // characters
  "mascot-happy":     { svg: "/assets/mascot/happy.svg" },
  "mascot-thinking":  { svg: "/assets/mascot/thinking.svg" },
  "mascot-celebrate": { svg: "/assets/mascot/celebrate.svg" },
};

// Usage in any component:
function AssetIcon({ hint, size }: { hint: string; size: number }) {
  const asset = ASSET_MAP[hint];
  if (asset?.svg) return <img src={asset.svg} width={size} />;
  if (asset?.emoji) return <span style={{ fontSize: size }}>{asset.emoji}</span>;
  return null;
}
```

- Every widget that currently ignores contextHint just wraps its display area with <AssetIcon hint={data.contextHint} />. One pattern, all widgets, progressive enhancement (emoji now, SVG later, photos eventually).