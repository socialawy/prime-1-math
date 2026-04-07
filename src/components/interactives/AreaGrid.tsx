import { useEffect, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, AreaGridData, GridCell } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

type CountLabel = string;

interface AreaGridState {
  phase: "counting" | "comparing" | "celebrate";
  markedCells: Record<string, Set<string>>;
  userCounts: Record<CountLabel, number | null>;
  activeField: CountLabel | "difference";
  inputBuffer: string;
  wrongField: string | null;
  mistakes: number;
  startTime: number;
}

type AreaGridAction =
  | { type: "TOGGLE_CELL"; label: string; cellKey: string }
  | { type: "TAP_FIELD"; field: CountLabel | "difference" }
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "BACKSPACE" }
  | { type: "CHECK_COUNTS" }
  | { type: "SUBMIT_DIFFERENCE" }
  | { type: "CHOOSE_SHAPE"; label: string }
  | { type: "CLEAR_WRONG" };

function initState(data: AreaGridData): AreaGridState {
  const shapeCounts = getShapeCounts(data);
  const countMode = getMode(data);
  const initialCounts = Object.fromEntries(
    shapeCounts.map((shape) => [shape.label, countMode === "count-compare" ? shape.count : null]),
  ) as Record<string, number | null>;

  return {
    phase: countMode === "count-compare" ? "comparing" : "counting",
    markedCells: Object.fromEntries(
      shapeCounts.map((shape) => [shape.label, new Set<string>()]),
    ) as Record<string, Set<string>>,
    userCounts: initialCounts,
    activeField: countMode === "count-compare" ? "difference" : shapeCounts[0]?.label ?? "difference",
    inputBuffer: "",
    wrongField: null,
    mistakes: 0,
    startTime: Date.now(),
  };
}

function reducer(
  state: AreaGridState,
  action: AreaGridAction,
  data: AreaGridData,
): AreaGridState {
  const shapeCounts = getShapeCounts(data);

  switch (action.type) {
    case "TOGGLE_CELL": {
      const current = new Set(state.markedCells[action.label] ?? new Set<string>());
      if (current.has(action.cellKey)) current.delete(action.cellKey);
      else current.add(action.cellKey);
      return {
        ...state,
        markedCells: { ...state.markedCells, [action.label]: current },
        userCounts: { ...state.userCounts, [action.label]: current.size },
      };
    }

    case "TAP_FIELD":
      return { ...state, activeField: action.field, inputBuffer: "" };

    case "TAP_NUMBER": {
      const next = state.inputBuffer + String(action.digit);
      if (next.length > 2) return state;
      return { ...state, inputBuffer: next };
    }

    case "BACKSPACE":
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) };

    case "CHECK_COUNTS": {
      if (state.inputBuffer !== "" && state.activeField !== "difference") {
        const value = parseInt(state.inputBuffer, 10);
        const nextCounts = { ...state.userCounts, [state.activeField]: value };
        const expected = shapeCounts.find((shape) => shape.label === state.activeField)?.count;
        if (expected !== value) {
          return {
            ...state,
            userCounts: nextCounts,
            inputBuffer: "",
            wrongField: state.activeField,
            mistakes: state.mistakes + 1,
          };
        }

        state = { ...state, userCounts: nextCounts, inputBuffer: "", wrongField: null };
      }

      const allCorrect = shapeCounts.every(
        (shape) => state.userCounts[shape.label] === shape.count,
      );
      if (!allCorrect) {
        return {
          ...state,
          wrongField: state.activeField === "difference" ? shapeCounts[0]?.label ?? null : state.activeField,
          mistakes: state.mistakes + 1,
        };
      }

      if (data.question === "count-each") {
        return { ...state, phase: "celebrate" };
      }

      return {
        ...state,
        phase: "comparing",
        activeField: data.question === "how-many-more" ? "difference" : state.activeField,
        inputBuffer: "",
        wrongField: null,
      };
    }

    case "SUBMIT_DIFFERENCE": {
      const value = parseInt(state.inputBuffer, 10);
      if (Number.isNaN(value) || value !== getExpectedDifference(data)) {
        return {
          ...state,
          inputBuffer: "",
          wrongField: "difference",
          mistakes: state.mistakes + 1,
        };
      }
      return { ...state, phase: "celebrate", inputBuffer: "", wrongField: null };
    }

    case "CHOOSE_SHAPE": {
      const expected = getExpectedChoice(data);
      if (expected !== action.label) {
        return {
          ...state,
          wrongField: action.label,
          mistakes: state.mistakes + 1,
        };
      }
      return { ...state, phase: "celebrate", wrongField: null };
    }

    case "CLEAR_WRONG":
      return { ...state, wrongField: null };

    default:
      return state;
  }
}

interface AreaGridProps {
  data: AreaGridData;
  onComplete: (result: ActivityResult) => void;
}

export function AreaGrid({ data, onComplete }: AreaGridProps) {
  const { audio } = useApp();
  const [state, rawDispatch] = useReducer(
    (s: AreaGridState, a: AreaGridAction) => reducer(s, a, data),
    data,
    initState,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shapeCounts = getShapeCounts(data);
  const mode = getMode(data);

  useEffect(() => {
    if (state.wrongField) {
      audio.playEffect("try-again");
      timerRef.current = setTimeout(() => rawDispatch({ type: "CLEAR_WRONG" }), 400);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.wrongField, audio]);

  useEffect(() => {
    if (state.phase === "celebrate") {
      audio.playEffect("stars-earned");
      timerRef.current = setTimeout(() => {
        onComplete({
          activityId: `area-grid-${mode}-${data.question}`,
          correct: true,
          attempts: state.mistakes + 1,
          timeMs: Date.now() - state.startTime,
          score: Math.max(0, 100 - state.mistakes * 10),
        });
      }, 1400);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.mistakes, state.startTime, mode, data.question, onComplete, audio]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center">
        <p className="text-lg font-medium text-blue-800">{getInstruction(data)}</p>
      </div>

      {mode === "grid-visual" ? (
        <GridBoard
          data={data}
          shapeCounts={shapeCounts}
          markedCells={state.markedCells}
          wrongField={state.wrongField}
          onToggleCell={(label, cellKey) => rawDispatch({ type: "TOGGLE_CELL", label, cellKey })}
        />
      ) : (
        <CountCompareCards
          shapeCounts={shapeCounts}
          onChoose={(label) => rawDispatch({ type: "CHOOSE_SHAPE", label })}
          wrongField={state.wrongField}
          disabled={state.phase !== "comparing" || data.question === "how-many-more"}
        />
      )}

      {/* Only show count fields when child needs to enter counts (not in count-compare mode) */}
      {mode !== "count-compare" && (
        <div className="grid gap-3 md:grid-cols-2">
          {shapeCounts.map((shape) => (
            <CountField
              key={shape.label}
              label={`${shape.label} squares`}
              value={state.userCounts[shape.label] ?? null}
              isActive={state.activeField === shape.label && state.phase === "counting"}
              isWrong={state.wrongField === shape.label}
              color={shape.color}
              buffer={state.activeField === shape.label ? state.inputBuffer : ""}
              onClick={() => rawDispatch({ type: "TAP_FIELD", field: shape.label })}
            />
          ))}
        </div>
      )}

      {state.phase === "counting" && (
        <>
          <div className="flex justify-center">
            <button
              onClick={() => rawDispatch({ type: "CHECK_COUNTS" })}
              className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow active:scale-95"
            >
              Check counts
            </button>
          </div>
          <NumberPad
            inputBuffer={state.inputBuffer}
            onTap={(digit) => rawDispatch({ type: "TAP_NUMBER", digit })}
            onBackspace={() => rawDispatch({ type: "BACKSPACE" })}
            onSubmit={() => rawDispatch({ type: "CHECK_COUNTS" })}
          />
        </>
      )}

      {state.phase === "comparing" && data.question === "how-many-more" && (
        <>
          <CountField
            label="How many more?"
            value={null}
            isActive={state.activeField === "difference"}
            isWrong={state.wrongField === "difference"}
            color="amber"
            buffer={state.activeField === "difference" ? state.inputBuffer : ""}
            onClick={() => rawDispatch({ type: "TAP_FIELD", field: "difference" })}
          />
          <NumberPad
            inputBuffer={state.inputBuffer}
            onTap={(digit) => rawDispatch({ type: "TAP_NUMBER", digit })}
            onBackspace={() => rawDispatch({ type: "BACKSPACE" })}
            onSubmit={() => rawDispatch({ type: "SUBMIT_DIFFERENCE" })}
          />
        </>
      )}

      {state.phase === "comparing" &&
        (data.question === "which-larger" || data.question === "which-smaller") &&
        mode === "grid-visual" && (
          <CountCompareCards
            shapeCounts={shapeCounts}
            onChoose={(label) => rawDispatch({ type: "CHOOSE_SHAPE", label })}
            wrongField={state.wrongField}
            disabled={false}
          />
        )}

      {state.phase === "celebrate" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-green-100 px-8 py-6 text-center"
        >
          <p className="text-2xl font-bold text-green-700">Great counting!</p>
        </motion.div>
      )}
    </div>
  );
}

function getMode(data: AreaGridData): "grid-visual" | "count-compare" {
  if (data.mode) return data.mode;
  return data.shapeA.length > 0 || data.shapeB.length > 0 ? "grid-visual" : "count-compare";
}

function getShapeCounts(data: AreaGridData): { label: string; count: number; color: string; cells: GridCell[] }[] {
  const labels = data.shapeLabels ?? ["Blue", "Orange"];
  const colors = data.shapeColors ?? ["blue", "orange"];

  if (data.shapeCounts) {
    return data.shapeCounts.map((shape, index) => ({
      label: shape.label,
      count: shape.count,
      color: shape.color,
      cells: index === 0 ? data.shapeA : data.shapeB,
    }));
  }

  return [
    { label: labels[0], count: data.shapeA.length, color: colors[0], cells: data.shapeA },
    { label: labels[1], count: data.shapeB.length, color: colors[1], cells: data.shapeB },
  ];
}

function getInstruction(data: AreaGridData): string {
  if (data.question === "how-many-more") return "Count the squares. How many more does the larger shape have?";
  if (data.question === "which-smaller") return "Count the squares. Which shape has the smaller area?";
  if (data.question === "count-each") return "Count the squares in each shape.";
  return "Count the squares. Which shape has the larger area?";
}

function getExpectedChoice(data: AreaGridData): string | null {
  if (typeof data.correctAnswer === "string") return data.correctAnswer;
  const shapeCounts = getShapeCounts(data);
  const first = shapeCounts[0];
  const second = shapeCounts[1];
  if (!first || !second) return null;
  if (data.question === "which-smaller") {
    return first.count <= second.count ? first.label : second.label;
  }
  if (data.question === "which-larger") {
    return first.count >= second.count ? first.label : second.label;
  }
  return null;
}

function getExpectedDifference(data: AreaGridData): number {
  if (typeof data.correctAnswer === "number") return data.correctAnswer;
  const shapeCounts = getShapeCounts(data);
  const first = shapeCounts[0];
  const second = shapeCounts[1];
  if (!first || !second) return 0;
  return Math.abs(first.count - second.count);
}

function GridBoard({
  data,
  shapeCounts,
  markedCells,
  wrongField,
  onToggleCell,
}: {
  data: AreaGridData;
  shapeCounts: { label: string; count: number; color: string; cells: GridCell[] }[];
  markedCells: Record<string, Set<string>>;
  wrongField: string | null;
  onToggleCell: (label: string, cellKey: string) => void;
}) {
  const rows = data.gridRows;
  const cols = data.gridCols;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`,
          maxWidth: `${cols * 44}px`,
        }}
      >
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const key = `${row},${col}`;
          const shape = shapeCounts.find((entry) =>
            entry.cells.some((cell) => cell.row === row && cell.col === col),
          );
          const isMarked = shape ? (markedCells[shape.label] ?? new Set()).has(key) : false;

          return (
            <button
              key={key}
              onClick={shape ? () => onToggleCell(shape.label, key) : undefined}
              className={`relative flex aspect-square items-center justify-center rounded border text-xs font-bold ${
                !shape
                  ? "border-gray-200 bg-white"
                  : shape.color === "blue"
                    ? "border-blue-300 bg-blue-100 text-blue-700"
                    : "border-orange-300 bg-orange-100 text-orange-700"
              } ${shape ? "active:scale-95" : ""} ${
                wrongField === shape?.label ? "ring-2 ring-red-300" : ""
              }`}
            >
              {isMarked ? "✓" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CountCompareCards({
  shapeCounts,
  onChoose,
  wrongField,
  disabled,
}: {
  shapeCounts: { label: string; count: number; color: string; cells: GridCell[] }[];
  onChoose: (label: string) => void;
  wrongField: string | null;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {shapeCounts.map((shape) => {
        const bgColor = shape.color === "blue" ? "bg-blue-50 text-blue-800" : "bg-orange-50 text-orange-800";
        const cellColor = shape.color === "blue" ? "bg-blue-400" : "bg-orange-400";
        // Layout squares in a grid: pick cols to make a compact rectangle
        const cols = shape.count <= 3 ? shape.count : Math.ceil(Math.sqrt(shape.count));

        return (
          <button
            key={shape.label}
            onClick={() => onChoose(shape.label)}
            disabled={disabled}
            className={`rounded-2xl p-5 text-center shadow-sm ${bgColor} ${wrongField === shape.label ? "ring-2 ring-red-300" : ""} disabled:opacity-80`}
          >
            <p className="mb-3 text-sm font-medium opacity-70">{shape.label}</p>
            <div
              className="mx-auto grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, 28px)`,
                justifyContent: "center",
              }}
            >
              {Array.from({ length: shape.count }, (_, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-sm border border-white/50 ${cellColor}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs opacity-50">area</p>
          </button>
        );
      })}
    </div>
  );
}

function CountField({
  label,
  value,
  isActive,
  isWrong,
  color,
  buffer,
  onClick,
}: {
  label: string;
  value: number | null;
  isActive: boolean;
  isWrong: boolean;
  color: string;
  buffer: string;
  onClick: () => void;
}) {
  const display = value !== null ? String(value) : buffer || (isActive ? "_" : "");
  const colorStyle =
    color === "orange"
      ? "text-orange-700"
      : color === "amber"
        ? "text-amber-700"
        : "text-blue-700";
  const boxStyle = isWrong
    ? "border-red-400 bg-red-50"
    : isActive
      ? "border-blue-500 bg-blue-50"
      : value !== null
        ? "border-green-400 bg-green-50"
        : "border-gray-200 bg-white";

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left shadow-sm ${boxStyle}`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${colorStyle}`}>{display}</p>
    </button>
  );
}

function NumberPad({
  inputBuffer,
  onTap,
  onBackspace,
  onSubmit,
}: {
  inputBuffer: string;
  onTap: (digit: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <PadButton key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
      </div>
      <div className="flex gap-2">
        {[6, 7, 8, 9, 0].map((n) => (
          <PadButton key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
        <PadButton label="⌫" onPress={onBackspace} variant="secondary" />
      </div>
      <button
        onClick={onSubmit}
        disabled={!inputBuffer}
        className="min-h-14 min-w-32 rounded-xl bg-blue-600 px-8 py-3 text-xl font-bold text-white shadow-md active:scale-95 disabled:bg-gray-300"
      >
        Check
      </button>
    </div>
  );
}

function PadButton({
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
