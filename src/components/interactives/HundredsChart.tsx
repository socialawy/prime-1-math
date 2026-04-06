import { useReducer, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HundredsChartData, ActivityResult } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

// ── State ──────────────────────────────────────────────

interface ChartState {
  phase: "interactive" | "celebrate";
  /** fill-missing & jump-by-10: userValue per cell position (null = unfilled) */
  filledCells: Record<number, number | null>;
  /** color-pattern: which cells the child has colored */
  coloredCells: Set<number>;
  /** which blank is currently focused (cell number 1-100) */
  selectedCell: number | null;
  inputBuffer: string;
  /** cells that just flashed wrong — cleared after animation */
  wrongCells: Set<number>;
  mistakes: number;
  startTime: number;
}

type ChartAction =
  | { type: "TAP_BLANK"; cell: number }
  | { type: "TAP_CELL"; cell: number }      // color-pattern & find-number
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" }
  | { type: "WRONG_CELL"; cell: number }
  | { type: "CLEAR_WRONG"; cell: number }
  | { type: "CELEBRATE" };

function initState(problem: HundredsChartData): ChartState {
  const blanks =
    problem.mode === "fill-missing"
      ? problem.missingCells ?? []
      : problem.jumpBlanks ?? [];

  const filledCells: Record<number, number | null> = {};
  for (const n of blanks) filledCells[n] = null;

  // Auto-select first blank
  const firstBlank = blanks[0] ?? null;

  return {
    phase: "interactive",
    filledCells,
    coloredCells: new Set(),
    selectedCell: firstBlank,
    inputBuffer: "",
    wrongCells: new Set(),
    mistakes: 0,
    startTime: Date.now(),
  };
}

function reducer(
  state: ChartState,
  action: ChartAction,
  problem: HundredsChartData,
): ChartState {
  switch (action.type) {
    case "TAP_BLANK":
      return { ...state, selectedCell: action.cell, inputBuffer: "" };

    case "TAP_CELL": {
      if (problem.mode === "color-pattern") {
        const target = problem.targetCells ?? [];
        if (!target.includes(action.cell)) {
          // Wrong cell — flash it
          const wrong = new Set(state.wrongCells).add(action.cell);
          return { ...state, wrongCells: wrong, mistakes: state.mistakes + 1 };
        }
        const colored = new Set(state.coloredCells).add(action.cell);
        const remaining = target.filter((c) => !colored.has(c));
        if (remaining.length === 0) {
          return { ...state, coloredCells: colored, phase: "celebrate" };
        }
        return { ...state, coloredCells: colored };
      }

      if (problem.mode === "find-number") {
        if (action.cell === problem.correctCell) {
          return { ...state, phase: "celebrate" };
        }
        const wrong = new Set(state.wrongCells).add(action.cell);
        return { ...state, wrongCells: wrong, mistakes: state.mistakes + 1 };
      }

      return state;
    }

    case "TAP_NUMBER": {
      const buf = state.inputBuffer + String(action.digit);
      if (buf.length > 3) return state;
      return { ...state, inputBuffer: buf };
    }

    case "BACKSPACE":
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) };

    case "SUBMIT": {
      if (!state.selectedCell || state.inputBuffer === "") return state;
      const value = parseInt(state.inputBuffer, 10);
      const correct = state.selectedCell; // the cell's own number is the answer

      if (value !== correct) {
        const wrong = new Set(state.wrongCells).add(state.selectedCell);
        return {
          ...state,
          wrongCells: wrong,
          inputBuffer: "",
          mistakes: state.mistakes + 1,
        };
      }

      const newFilled = { ...state.filledCells, [state.selectedCell]: value };
      const allBlanks = Object.keys(newFilled).map(Number);
      const allDone = allBlanks.every((k) => newFilled[k] !== null);

      if (allDone) {
        return {
          ...state,
          filledCells: newFilled,
          inputBuffer: "",
          phase: "celebrate",
        };
      }

      // Advance to next unfilled blank
      const nextBlank = allBlanks
        .sort((a, b) => a - b)
        .find((k) => newFilled[k] === null) ?? null;

      return {
        ...state,
        filledCells: newFilled,
        selectedCell: nextBlank,
        inputBuffer: "",
      };
    }

    case "WRONG_CELL":
      return {
        ...state,
        wrongCells: new Set(state.wrongCells).add(action.cell),
        mistakes: state.mistakes + 1,
      };

    case "CLEAR_WRONG": {
      const w = new Set(state.wrongCells);
      w.delete(action.cell);
      return { ...state, wrongCells: w };
    }

    case "CELEBRATE":
      return { ...state, phase: "celebrate" };

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────

interface HundredsChartProps {
  data: HundredsChartData;
  onComplete: (result: ActivityResult) => void;
}

export function HundredsChart({ data, onComplete }: HundredsChartProps) {
  const { audio } = useApp();
  const [state, rawDispatch] = useReducer(
    (s: ChartState, a: ChartAction) => reducer(s, a, data),
    data,
    initState,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dispatch = useCallback((a: ChartAction) => rawDispatch(a), []);

  // Clear wrong-cell flash after 400ms
  useEffect(() => {
    for (const cell of state.wrongCells) {
      const t = setTimeout(() => {
        dispatch({ type: "CLEAR_WRONG", cell });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [state.wrongCells, dispatch]);

  // Sound on wrong
  useEffect(() => {
    if (state.wrongCells.size > 0) audio.playEffect("try-again");
  }, [state.wrongCells, audio]);

  // Celebrate → onComplete
  useEffect(() => {
    if (state.phase === "celebrate") {
      audio.playEffect("stars-earned");
      timerRef.current = setTimeout(() => {
        onComplete({
          activityId: `hundreds-${data.mode}`,
          correct: true,
          attempts: state.mistakes + 1,
          timeMs: Date.now() - state.startTime,
          score: Math.max(0, 100 - state.mistakes * 10),
        });
      }, 1500);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.mistakes, state.startTime, data.mode, onComplete, audio]);

  const needsNumberPad =
    state.phase === "interactive" &&
    (data.mode === "fill-missing" || data.mode === "jump-by-10") &&
    state.selectedCell !== null;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 p-3">
      {/* Instruction / riddle */}
      <InstructionBar data={data} />

      {/* The grid */}
      <div className="w-full overflow-x-auto">
        <Grid data={data} state={state} dispatch={dispatch} />
      </div>

      {/* Celebrate overlay */}
      <AnimatePresence>
        {state.phase === "celebrate" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl bg-green-100 px-8 py-6 text-center"
          >
            <p className="text-5xl">🌟</p>
            <p className="mt-1 text-2xl font-bold text-green-700">Well done!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number pad */}
      {needsNumberPad && (
        <NumberPad
          inputBuffer={state.inputBuffer}
          selectedCell={state.selectedCell}
          onTap={(d) => dispatch({ type: "TAP_NUMBER", digit: d })}
          onBackspace={() => dispatch({ type: "BACKSPACE" })}
          onSubmit={() => dispatch({ type: "SUBMIT" })}
        />
      )}
    </div>
  );
}

// ── Instruction bar ────────────────────────────────────

function InstructionBar({ data }: { data: HundredsChartData }) {
  let text = "";
  if (data.mode === "fill-missing")
    text = "Fill in the missing numbers.";
  else if (data.mode === "jump-by-10")
    text = "Fill in the missing numbers — each one is +10 from the one above.";
  else if (data.mode === "color-pattern")
    text = data.patternRule ?? "Color the cells that match the pattern.";
  else if (data.mode === "find-number")
    text = data.riddle ?? "Find the number on the chart.";

  return (
    <div className="w-full rounded-xl bg-blue-50 px-4 py-3 text-center text-lg font-medium text-blue-800">
      {text}
    </div>
  );
}

// ── Grid ───────────────────────────────────────────────

function Grid({
  data,
  state,
  dispatch,
}: {
  data: HundredsChartData;
  state: ChartState;
  dispatch: (a: ChartAction) => void;
}) {
  const preHighlighted = new Set(data.preHighlighted ?? []);
  const missingCells = new Set(
    data.mode === "fill-missing"
      ? (data.missingCells ?? [])
      : (data.jumpBlanks ?? []),
  );
  const jumpCol =
    data.mode === "jump-by-10" && data.jumpStart != null
      ? data.jumpStart
      : null;

  return (
    <div className="relative">
      {/* Jump-by-10 column highlight stripe */}
      {jumpCol !== null && (
        <ColumnStripe col={jumpCol} />
      )}

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(10, minmax(36px, 1fr))",
          gap: "2px",
          minWidth: "380px",
        }}
      >
        {Array.from({ length: 100 }, (_, i) => {
          const n = i + 1;
          const isMissing = missingCells.has(n);
          const isPreHighlighted = preHighlighted.has(n);
          const isColored = state.coloredCells.has(n);
          const isSelected = state.selectedCell === n;
          const isWrong = state.wrongCells.has(n);
          const filledValue = state.filledCells[n];
          const isTarget = (data.targetCells ?? []).includes(n);
          const isCorrectCell = data.correctCell === n && state.phase === "celebrate";

          return (
            <Cell
              key={n}
              n={n}
              isMissing={isMissing}
              filledValue={filledValue ?? null}
              isPreHighlighted={isPreHighlighted}
              isColored={isColored}
              isSelected={isSelected}
              isWrong={isWrong}
              isTarget={isTarget}
              isCorrectCell={isCorrectCell}
              mode={data.mode}
              inputBuffer={isSelected ? state.inputBuffer : ""}
              onTapBlank={() => dispatch({ type: "TAP_BLANK", cell: n })}
              onTapCell={() => dispatch({ type: "TAP_CELL", cell: n })}
            />
          );
        })}
      </div>

      {/* +10 arrows for jump-by-10 */}
      {data.mode === "jump-by-10" && jumpCol !== null && (
        <JumpArrows
          col={jumpCol}
          preHighlighted={data.preHighlighted ?? []}
          jumpBlanks={data.jumpBlanks ?? []}
          filledCells={state.filledCells}
        />
      )}
    </div>
  );
}

// ── Column highlight stripe (behind the grid cells) ───

function ColumnStripe({ col }: { col: number }) {
  // col is 1-10; position = (col-1) / 10 of total width
  const leftPct = ((col - 1) / 10) * 100;
  const widthPct = 10;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    >
      <div
        className="absolute inset-y-0 rounded bg-yellow-100"
        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      />
    </div>
  );
}

// ── Jump arrows overlay ────────────────────────────────

function JumpArrows({
  col,
  preHighlighted,
  jumpBlanks,
  filledCells,
}: {
  col: number;
  preHighlighted: number[];
  jumpBlanks: number[];
  filledCells: Record<number, number | null>;
}) {
  // Build the full column sequence
  const fullCol = Array.from({ length: 10 }, (_, i) => col + i * 10);

  const arrows: { from: number; to: number; show: boolean }[] = [];
  for (let i = 0; i < fullCol.length - 1; i++) {
    const from = fullCol[i]!;
    const to = fullCol[i + 1]!;
    const fromVisible =
      preHighlighted.includes(from) || filledCells[from] !== undefined;
    const toVisible =
      preHighlighted.includes(to) ||
      (jumpBlanks.includes(to) && filledCells[to] !== null);
    arrows.push({ from, to, show: fromVisible && toVisible });
  }

  return (
    <>
      {arrows
        .filter((a) => a.show)
        .map(({ from }) => {
          const rowIndex = Math.floor((from - 1) / 10);
          // Position the +10 label between row rowIndex and rowIndex+1
          // Each cell is ~38px (36px + 2px gap)
          const topPx = rowIndex * 38 + 26; // roughly in the gap
          const colIndex = (col - 1) / 10;
          return (
            <motion.div
              key={`arrow-${from}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pointer-events-none absolute z-10 flex items-center gap-0.5 text-xs font-bold text-blue-600"
              style={{
                top: topPx,
                left: `calc(${colIndex * 100}% + 2px)`,
                width: "10%",
                justifyContent: "center",
              }}
            >
              ↓+10
            </motion.div>
          );
        })}
    </>
  );
}

// ── Individual cell ────────────────────────────────────

interface CellProps {
  n: number;
  isMissing: boolean;
  filledValue: number | null;
  isPreHighlighted: boolean;
  isColored: boolean;
  isSelected: boolean;
  isWrong: boolean;
  isTarget: boolean;
  isCorrectCell: boolean;
  mode: HundredsChartData["mode"];
  inputBuffer: string;
  onTapBlank: () => void;
  onTapCell: () => void;
}

function Cell({
  n,
  isMissing,
  filledValue,
  isPreHighlighted,
  isColored,
  isSelected,
  isWrong,
  isTarget,
  isCorrectCell,
  mode,
  inputBuffer,
  onTapBlank,
  onTapCell,
}: CellProps) {
  const isClickable =
    (isMissing && filledValue === null) ||
    mode === "color-pattern" ||
    mode === "find-number";

  let bg = "bg-white";
  let textColor = "text-gray-700";
  let border = "border border-gray-200";

  if (isPreHighlighted) {
    bg = "bg-yellow-200";
    textColor = "text-yellow-900";
    border = "border border-yellow-300";
  }
  if (isColored) {
    bg = "bg-green-300";
    textColor = "text-green-900";
    border = "border border-green-400";
  }
  if (isMissing && filledValue !== null) {
    // correctly filled
    bg = "bg-green-100";
    textColor = "text-green-700";
    border = "border border-green-400";
  }
  if (isSelected && filledValue === null) {
    bg = "bg-blue-50";
    border = "border-2 border-blue-500";
  }
  if (isWrong) {
    bg = "bg-red-100";
    border = "border border-red-400";
  }
  if (isCorrectCell) {
    bg = "bg-amber-300";
    textColor = "text-amber-900";
    border = "border-2 border-amber-500";
  }
  // Tappable-but-not-yet-colored target hint (subtle dashed)
  if (isTarget && !isColored && mode === "color-pattern") {
    border = "border border-dashed border-green-300";
  }

  let display: string | React.ReactNode;
  if (isMissing && filledValue === null) {
    display = isSelected && inputBuffer ? inputBuffer : "";
  } else if (isMissing && filledValue !== null) {
    display = String(filledValue);
  } else {
    display = String(n);
  }

  return (
    <motion.button
      animate={isWrong ? { x: [0, -3, 3, -3, 0] } : {}}
      transition={{ duration: 0.25 }}
      onClick={isClickable ? (isMissing ? onTapBlank : onTapCell) : undefined}
      disabled={!isClickable || (isMissing && filledValue !== null)}
      className={`
        flex aspect-square min-h-9 min-w-9 items-center justify-center
        rounded text-xs font-mono font-semibold tabular-nums
        transition-colors
        ${bg} ${textColor} ${border}
        ${isClickable && filledValue === null ? "active:scale-90 cursor-pointer" : "cursor-default"}
        ${isSelected && filledValue === null ? "animate-pulse" : ""}
      `}
    >
      {display}
    </motion.button>
  );
}

// ── Number pad ─────────────────────────────────────────

function NumberPad({
  inputBuffer,
  selectedCell,
  onTap,
  onBackspace,
  onSubmit,
}: {
  inputBuffer: string;
  selectedCell: number | null;
  onTap: (d: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Input preview */}
      <div className="flex items-center gap-2 text-lg">
        <span className="text-gray-400">Answer:</span>
        <span className="min-w-12 rounded-lg border-2 border-blue-400 bg-blue-50 px-3 py-1 text-center font-bold text-blue-700">
          {inputBuffer || "_"}
        </span>
        {selectedCell && (
          <span className="text-sm text-gray-400">(cell {selectedCell})</span>
        )}
      </div>

      {/* Row 1: 1-5 */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <PadBtn key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
      </div>
      {/* Row 2: 6-0 + backspace */}
      <div className="flex gap-2">
        {[6, 7, 8, 9, 0].map((n) => (
          <PadBtn key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
        <PadBtn label="⌫" onPress={onBackspace} variant="secondary" />
      </div>
      <button
        onClick={onSubmit}
        disabled={!inputBuffer}
        className="min-h-14 min-w-32 rounded-xl bg-blue-600 px-8 py-3 text-xl font-bold text-white shadow-md active:scale-95 disabled:bg-gray-300"
      >
        ✓ Check
      </button>
    </div>
  );
}

function PadBtn({
  label,
  onPress,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onPress}
      className={`min-h-14 min-w-14 rounded-xl text-2xl font-bold transition active:scale-90 ${
        variant === "secondary"
          ? "bg-gray-200 text-gray-700"
          : "border border-gray-200 bg-white text-gray-900 shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}
