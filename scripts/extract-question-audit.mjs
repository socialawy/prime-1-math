import { createServer } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const docsDir = path.join(repoRoot, "docs");
const dataDir = path.join(repoRoot, "data");
const seed = Number(process.env.QUESTION_AUDIT_SEED ?? 101);

Math.random = mulberry32(seed);

const chapterIds = ["ch10", "ch11", "ch12", "ch13", "ch14", "ch15", "ch16", "ch17"];

const server = await createServer({
  root: repoRoot,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [{ buildLessonForChapter }, { adaptFlashChapter }] = await Promise.all([
    server.ssrLoadModule("/src/lib/lessonBuilder.ts"),
    server.ssrLoadModule("/src/lib/adapters/flashDataAdapter.ts"),
  ]);

  const sourceChapters = await loadSourceChapters();
  const rawRows = sourceChapters.flatMap((chapter) => extractRawRows(chapter));
  const adaptedRows = sourceChapters.flatMap((chapter) => {
    const adapted = adaptFlashChapter(chapter);
    return adapted.activities.map((activity, index) =>
      toActivityRow({
        scope: "adapted-source",
        chapterId: `ch${chapter.chapter}`,
        chapterTitle: chapter.title,
        sequence: index + 1,
        activity,
        sourceIds: [activity.id],
      }),
    );
  });

  const adaptedById = new Map(adaptedRows.map((row) => [row.activityId, row]));
  const adaptedByHash = groupBy(adaptedRows, (row) => row.dataHash);

  const builtRows = chapterIds.flatMap((chapterId) => {
    const lesson = buildLessonForChapter(chapterId);
    return lesson.activities.map((activity, index) => {
      const base = toActivityRow({
        scope: "built-lesson",
        chapterId,
        chapterTitle: lesson.titleEn,
        sequence: index + 1,
        activity,
        sourceIds: [],
      });
      const direct = adaptedById.get(activity.id);
      const hashMatches = adaptedByHash.get(base.dataHash) ?? [];
      const matches = direct ? [direct] : hashMatches;
      return {
        ...base,
        origin: matches.length > 0 ? "source/adapted" : "generated/fallback",
        sourceIds: matches.map((match) => match.activityId),
      };
    });
  });

  const assessmentRows = extractAssessmentRows(await readJson(path.join(dataDir, "assessments.json")));
  const allRows = [...builtRows, ...rawRows, ...adaptedRows, ...assessmentRows];
  const reviewFindings = createReviewFindings(builtRows);

  await mkdir(docsDir, { recursive: true });
  await writeFile(
    path.join(docsDir, "question-audit.json"),
    `${JSON.stringify({ seed, generatedAt: new Date().toISOString(), reviewFindings, rows: allRows }, null, 2)}\n`,
  );
  await writeFile(path.join(docsDir, "question-audit.csv"), toCsv(allRows));
  await writeFile(path.join(docsDir, "QUESTION_AUDIT.md"), toMarkdown({ seed, builtRows, rawRows, adaptedRows, assessmentRows, reviewFindings }));

  console.log(`Question audit written with seed ${seed}.`);
  console.log(`Built lesson rows: ${builtRows.length}`);
  console.log(`Raw source rows: ${rawRows.length}`);
  console.log(`Adapted source rows: ${adaptedRows.length}`);
  console.log(`Assessment source rows: ${assessmentRows.length}`);
} finally {
  await server.close();
}

async function loadSourceChapters() {
  const chapters = [];
  for (const chapterId of chapterIds) {
    const chapterNum = Number(chapterId.replace("ch", ""));
    const raw = await readJson(path.join(dataDir, `chapter_${chapterNum}.json`));
    chapters.push(normalizeChapter(raw, chapterNum));
  }
  return chapters;
}

function normalizeChapter(raw, chapterNum) {
  if (!Array.isArray(raw)) return raw;
  return {
    chapter: chapterNum,
    title: `Chapter ${chapterNum}`,
    problems: raw.flatMap((sheet) => sheet.problems ?? []),
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function extractRawRows(chapter) {
  return (chapter.problems ?? []).flatMap((problem, problemIndex) => {
    const expanded = expandRawProblem(problem);
    return expanded.map((entry, entryIndex) => ({
      scope: "raw-source",
      chapterId: `ch${chapter.chapter}`,
      chapterTitle: chapter.title,
      sequence: problemIndex + 1,
      activityId: entry.id,
      sourceIds: [problem.id],
      type: problem.type,
      conceptKey: inferConceptFromRaw(problem.type),
      prompt: entry.prompt,
      answer: stringifyAnswer(entry.answer),
      options: stringifyAnswer(entry.options),
      dataHash: hashJson(entry),
      origin: "source-json",
      notes: entryIndex === 0 ? "" : `expanded from ${problem.id}`,
    }));
  });
}

function expandRawProblem(problem) {
  const instruction = problem.instruction ?? "";
  if (Array.isArray(problem.items)) {
    return problem.items.map((item, index) => ({
      id: index === 0 ? problem.id : `${problem.id}-${index + 1}`,
      prompt: buildRawPrompt(instruction, item),
      answer: item.answer ?? item.cups ?? item.counts ?? problem.answer,
      options: item.options ?? item.items ?? problem.options,
    }));
  }
  if (Array.isArray(problem.data)) {
    return problem.data.map((item, index) => ({
      id: index === 0 ? problem.id : `${problem.id}-${index + 1}`,
      prompt: buildRawPrompt(instruction, item),
      answer: item.answer ?? problem.answer,
      options: item.options,
    }));
  }
  if (Array.isArray(problem.pairs)) {
    return problem.pairs.map((pair, index) => ({
      id: index === 0 ? problem.id : `${problem.id}-${index + 1}`,
      prompt: instruction,
      answer: pair,
      options: problem.data?.names,
    }));
  }
  if (Array.isArray(problem.characters)) {
    return [{
      id: problem.id,
      prompt: `${instruction} ${problem.question ?? ""}`.trim(),
      answer: problem.answer,
      options: problem.characters.map((item) => item.name ?? item.id),
    }];
  }
  return [{
    id: problem.id,
    prompt: instruction,
    answer: problem.answer ?? problem.data?.answer,
    options: problem.options,
  }];
}

function buildRawPrompt(instruction, item) {
  const parts = [instruction];
  if (item?.target?.imageType) parts.push(`target=${item.target.imageType}`);
  if (item?.source) parts.push(`source=${item.source}`);
  if (item?.equation) parts.push(item.equation);
  if (item?.question) parts.push(item.question);
  return parts.filter(Boolean).join(" | ");
}

function extractAssessmentRows(assessments) {
  return assessments.flatMap((assessment) =>
    (assessment.problems ?? []).map((problem, index) => ({
      scope: "assessment-source",
      chapterId: assessment.id,
      chapterTitle: assessment.title,
      sequence: index + 1,
      activityId: problem.id,
      sourceIds: [problem.id],
      type: problem.type,
      conceptKey: inferConceptFromRaw(problem.type),
      prompt: problem.instruction ?? "",
      answer: stringifyAnswer(problem.answer ?? problem.items ?? problem.pairs),
      options: stringifyAnswer(problem.options ?? problem.items),
      dataHash: hashJson(problem),
      origin: "assessment-json",
      notes: "",
    })),
  );
}

function toActivityRow({ scope, chapterId, chapterTitle, sequence, activity, sourceIds }) {
  return {
    scope,
    chapterId,
    chapterTitle,
    sequence,
    activityId: activity.id,
    sourceIds,
    type: activity.type,
    conceptKey: activity.conceptKey,
    prompt: describePrompt(activity),
    answer: describeAnswer(activity.data),
    options: describeOptions(activity.data),
    dataHash: hashJson(activity.data),
    origin: "unknown",
    notes: activity.contextHint ? `context=${activity.contextHint}` : "",
  };
}

function describePrompt(activity) {
  const data = activity.data;
  switch (data.type) {
    case "shape-3d-identify":
      return `Which option is ${data.targetShape}?`;
    case "shape-3d-to-2d":
      return `What 2D shape comes from ${data.shape3d}?`;
    case "compare-capacity":
      return capacityPrompt(data);
    case "compare-area":
      return areaPrompt(data);
    case "addition":
    case "subtraction":
      return data.equation;
    case "place-value-group":
      return `Group/count ${data.totalItems} ${data.visualType}`;
    case "place-value-hundreds-chart":
      return data.riddle ?? `${data.mode} on hundreds chart`;
    case "place-value-number-line":
      return `Fill number line ${data.rangeStart}-${data.rangeEnd}, jump ${data.jumpSize}`;
    case "compose-shapes":
      return data.targetDescription ?? `Make ${data.targetShape}`;
    case "tell-time":
      return data.mode === "set-time" ? `Set ${data.correctHour} ${data.correctMinuteLabel}` : "What time is it?";
    case "add-sub-mixed":
      return data.storyEn;
    case "number-comparison":
      return data.pairs.map((pair) => `${pair.left.label} ? ${pair.right.label}`).join("; ");
    case "art-corner":
      return data.instruction;
    default:
      return data.type ?? activity.conceptKey;
  }
}

function describeAnswer(data) {
  switch (data.type) {
    case "shape-3d-identify":
      return data.options[data.correctIndex] ?? `index ${data.correctIndex}`;
    case "shape-3d-to-2d":
      return data.correctFootprint;
    case "compare-capacity":
      return data.correctOrder ? `order ${data.correctOrder.join(" -> ")} / ${stringifyAnswer(data.correctAnswer)}` : stringifyAnswer(data.correctAnswer);
    case "compare-area":
      return stringifyAnswer(data.correctAnswer);
    case "addition":
    case "subtraction":
      return stringifyAnswer({ finalAnswer: data.finalAnswer, blanks: data.steps.flatMap((step) => step.blanks.map((blank) => blank.correctValue)) });
    case "place-value-group":
      return `${data.expectedTens} tens, ${data.expectedOnes} ones`;
    case "place-value-hundreds-chart":
      return stringifyAnswer(data.correctCell ?? data.missingCells ?? data.jumpBlanks ?? data.targetCells);
    case "place-value-number-line":
      return stringifyAnswer(data.missingPoints);
    case "compose-shapes":
      return data.correctOptionId ?? stringifyAnswer(data.correctCombination);
    case "tell-time":
      return data.correctOption ?? `${data.correctHour} ${data.correctMinuteLabel}`;
    case "add-sub-mixed":
      return String(data.correctAnswer);
    case "number-comparison":
      return data.pairs.map((pair) => `${pair.left.label} ${pair.correctSymbol} ${pair.right.label}`).join("; ");
    case "art-corner":
      return stringifyAnswer(data.regions.map((region) => [region.id, region.correctResult, region.correctColor]));
    default:
      return "";
  }
}

function describeOptions(data) {
  switch (data.type) {
    case "shape-3d-identify":
      return stringifyAnswer(data.options);
    case "shape-3d-to-2d":
      return stringifyAnswer([data.correctFootprint, ...data.distractors]);
    case "compare-capacity":
      return stringifyAnswer(data.containers.map((item) => `${item.id ?? item.label}:${item.capacityCups}`));
    case "compare-area":
      return stringifyAnswer(data.shapeCounts ?? data.shapeLabels);
    case "tell-time":
      return stringifyAnswer(data.options);
    case "compose-shapes":
      return stringifyAnswer(data.options ?? data.availablePieces);
    case "number-comparison":
      return ">; <; =";
    default:
      return "";
  }
}

function capacityPrompt(data) {
  if (data.mode === "order-multiple") return "Arrange containers from least to most cups.";
  if (data.mode === "difference") return "How many more cups does one container have?";
  if (data.mode === "count-cups") return "Count the cups for each container.";
  return data.question === "which-less" ? "Tap the container that has less water." : "Tap the container that has more water.";
}

function areaPrompt(data) {
  if (data.question === "how-many-more") return "How many more squares?";
  if (data.question === "which-smaller") return "Which shape has the smaller area?";
  if (data.question === "count-each") return "Count each area.";
  return "Which shape has the larger area?";
}

function inferConceptFromRaw(type) {
  if (/shape|3d|footprint|trace|odd_one_out/.test(type)) return "shape";
  if (/capacity|cup|ordering/.test(type)) return "capacity";
  if (/area/.test(type)) return "area";
  if (/clock|time/.test(type)) return "time";
  if (/place|100|number|grid|ten|missing/.test(type)) return "place-value/number";
  if (/word|arithmetic|addition|subtraction|blank|result|math/.test(type)) return "arithmetic";
  return "";
}

function createReviewFindings(builtRows) {
  const findings = [];
  const byChapter = groupBy(builtRows, (row) => row.chapterId);
  for (const [chapterId, rows] of byChapter.entries()) {
    if (rows.length !== 8) {
      findings.push({
        priority: "P1",
        area: "lesson-count",
        detail: `${chapterId} builds ${rows.length} activities instead of the expected 8. This usually means content was dropped by deduplication or a fallback collided.`,
      });
    }
  }

  const generated = builtRows.filter((row) => row.origin === "generated/fallback");
  if (generated.length > 0) {
    findings.push({
      priority: "P2",
      area: "source-coverage",
      detail: `${generated.length}/${builtRows.length} built activities are generated/fallback rows, not direct source matches. Review these against the workbook before calling the question set source-locked.`,
    });
  }

  const suspiciousComparison = builtRows.filter(
    (row) =>
      row.conceptKey.startsWith("guided-box") &&
      /\s[?]\s/.test(row.prompt) &&
      !/[+-]/.test(row.prompt),
  );
  for (const row of suspiciousComparison) {
    findings.push({
      priority: "P1",
      area: "adapter-mismatch",
      detail: `${row.activityId} is a comparison prompt rendered as ${row.conceptKey}: "${row.prompt}" -> ${row.answer}. It needs a comparison-specific widget/adapter, not GuidedBoxFill arithmetic.`,
    });
  }

  return findings;
}

function toMarkdown({ seed, builtRows, rawRows, adaptedRows, assessmentRows, reviewFindings }) {
  const lines = [
    "# Question Audit",
    "",
    `Generated with seed \`${seed}\`. Re-run with \`QUESTION_AUDIT_SEED=<n> npm run audit:questions\` for another deterministic generated set.`,
    "",
    "## Counts",
    "",
    `- Built lesson activities: ${builtRows.length}`,
    `- Raw source rows: ${rawRows.length}`,
    `- Adapted source activities: ${adaptedRows.length}`,
    `- Assessment source rows: ${assessmentRows.length}`,
    "",
    "## Initial Review Findings",
    "",
    ...(reviewFindings.length
      ? reviewFindings.map((finding) => `- **${finding.priority} ${finding.area}**: ${finding.detail}`)
      : ["- No automated review findings from the current extraction pass."]),
    "",
    "## Built Lesson Activities",
    "",
    "| # | Chapter | Activity | Origin | Concept | Prompt | Answer | Source match |",
    "| - | - | - | - | - | - | - | - |",
    ...builtRows.map((row, index) =>
      `| ${index + 1} | ${esc(row.chapterId)} | ${esc(row.activityId)} | ${esc(row.origin)} | ${esc(row.conceptKey)} | ${esc(row.prompt)} | ${esc(row.answer)} | ${esc(row.sourceIds.join(", "))} |`,
    ),
    "",
    "## Raw Source Rows",
    "",
    "| # | Chapter | Source id | Type | Prompt | Answer |",
    "| - | - | - | - | - | - |",
    ...rawRows.map((row, index) =>
      `| ${index + 1} | ${esc(row.chapterId)} | ${esc(row.activityId)} | ${esc(row.type)} | ${esc(row.prompt)} | ${esc(row.answer)} |`,
    ),
    "",
    "## Assessment Source Rows",
    "",
    "| # | Assessment | Source id | Type | Prompt | Answer |",
    "| - | - | - | - | - | - |",
    ...assessmentRows.map((row, index) =>
      `| ${index + 1} | ${esc(row.chapterTitle)} | ${esc(row.activityId)} | ${esc(row.type)} | ${esc(row.prompt)} | ${esc(row.answer)} |`,
    ),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function toCsv(rows) {
  const headers = ["scope", "chapterId", "sequence", "activityId", "origin", "sourceIds", "type", "conceptKey", "prompt", "answer", "options", "notes", "dataHash"];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csv(row[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

function hashJson(value) {
  const text = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function stringifyAnswer(value) {
  if (value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function esc(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ").slice(0, 220);
}

function csv(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function mulberry32(initialSeed) {
  let state = initialSeed >>> 0;
  return function random() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
