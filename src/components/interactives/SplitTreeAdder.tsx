import { useReducer, useEffect, useRef, useCallback } from "react";
import { DndContext, type DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import type { SplitTreeProblem, ActivityResult } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";
import { TenFrame } from "../shared/TenFrame";
import { DraggableDots } from "../shared/DraggableDots";

// ── State Machine ──────────────────────────────────────

type Phase =
  | "show-problem"
  | "choose-split"
  | "split-open"
  | "fill-split"
  | "drag-to-ten"
  | "ten-complete"
  | "final-answer"
  | "celebrate";

interface SplitTreeState {
  phase: Phase;
  numberA: number;
  numberB: number;
  mode: "addition" | "subtraction";
  splitTarget: "A" | "B" | null;
  splitValues: [number | null, number | null];
  correctSplit: [number, number] | null;
  tenFrameCount: number;
  looseDotsCount: number;
  activeSplitIndex: 0 | 1;
  inputBuffer: string;
  userFinalAnswer: number | null;
  mistakes: number;
  showHint: boolean;
  startTime: number;
}

type SplitTreeAction =
  | { type: "AUTO_ADVANCE" }
  | { type: "CHOOSE_SPLIT"; target: "A" | "B" }
  | { type: "SPLIT_OPEN_DONE" }
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "SET_BUFFER"; value: string }
  | { type: "BACKSPACE" }
  | { type: "CONFIRM_SPLIT" }
  | { type: "WRONG_SPLIT" }
  | { type: "DRAG_DOT_TO_FRAME" }
  | { type: "TEN_FRAME_FULL" }
  | { type: "SUBMIT_FINAL"; answer: number }
  | { type: "WRONG_ANSWER" }
  | { type: "CELEBRATE" };

function initState(problem: SplitTreeProblem): SplitTreeState {
  return {
    phase: "show-problem",
    numberA: problem.numberA,
    numberB: problem.numberB,
    mode: problem.mode,
    splitTarget: problem.allowSplitChoice ? null : (problem.presetSplit ?? "B"),
    splitValues: [null, null],
    correctSplit: null,
    tenFrameCount: 0,
    looseDotsCount: problem.mode === "addition" ? problem.numberB : 0,
    activeSplitIndex: 0,
    inputBuffer: "",
    userFinalAnswer: null,
    mistakes: 0,
    showHint: false,
    startTime: Date.now(),
  };
}

function reducer(state: SplitTreeState, action: SplitTreeAction): SplitTreeState {
  switch (action.type) {
    case "AUTO_ADVANCE": {
      if (state.phase === "show-problem") {
        // If no choice needed, compute split and go to split-open
        if (state.splitTarget) {
          const computed = computeSplit(state);
          return {
            ...state,
            phase: "split-open",
            correctSplit: computed.correctSplit,
            tenFrameCount: computed.tenFrameCount,
            looseDotsCount: computed.looseDotsCount,
          };
        }
        return { ...state, phase: "choose-split" };
      }
      if (state.phase === "split-open") {
        return { ...state, phase: "fill-split" };
      }
      if (state.phase === "ten-complete") {
        return { ...state, phase: "final-answer", inputBuffer: "" };
      }
      return state;
    }

    case "CHOOSE_SPLIT": {
      const newState = {
        ...state,
        splitTarget: action.target,
      };
      const computed = computeSplit(newState);
      return {
        ...newState,
        phase: "split-open" as const,
        correctSplit: computed.correctSplit,
        tenFrameCount: computed.tenFrameCount,
        looseDotsCount: computed.looseDotsCount,
      };
    }

    case "SPLIT_OPEN_DONE":
      return { ...state, phase: "fill-split" };

    case "TAP_NUMBER": {
      const buf = state.inputBuffer + String(action.digit);
      if (buf.length > 2) return state;
      return { ...state, inputBuffer: buf };
    }

    case "SET_BUFFER": {
      if (action.value.length > 2) return state;
      return { ...state, inputBuffer: action.value };
    }

    case "BACKSPACE":
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) };

    case "CONFIRM_SPLIT": {
      const value = parseInt(state.inputBuffer, 10);
      if (isNaN(value) || !state.correctSplit) return state;

      const idx = state.activeSplitIndex;
      const correct = state.correctSplit[idx];

      if (value !== correct) {
        return {
          ...state,
          mistakes: state.mistakes + 1,
          showHint: state.mistakes + 1 >= 2,
          inputBuffer: "",
        };
      }

      const newValues: [number | null, number | null] = [...state.splitValues];
      newValues[idx] = value;

      // First blank done, move to second
      if (idx === 0) {
        return {
          ...state,
          splitValues: newValues,
          activeSplitIndex: 1,
          inputBuffer: "",
          showHint: false,
        };
      }

      // Both done — validate they sum to the target number
      return {
        ...state,
        splitValues: newValues,
        phase: "drag-to-ten",
        inputBuffer: "",
        showHint: false,
      };
    }

    case "DRAG_DOT_TO_FRAME": {
      const newCount = state.tenFrameCount + 1;
      const newLoose = state.looseDotsCount - 1;
      return {
        ...state,
        tenFrameCount: newCount,
        looseDotsCount: newLoose,
      };
    }

    case "TEN_FRAME_FULL":
      return { ...state, phase: "ten-complete" };

    case "SUBMIT_FINAL": {
      return { ...state, userFinalAnswer: action.answer };
    }

    case "WRONG_ANSWER":
      return {
        ...state,
        mistakes: state.mistakes + 1,
        showHint: state.mistakes + 1 >= 2,
        userFinalAnswer: null,
        inputBuffer: "",
      };

    case "CELEBRATE":
      return { ...state, phase: "celebrate" };

    default:
      return state;
  }
}

function computeSplit(state: { splitTarget: "A" | "B" | null; numberA: number; numberB: number; mode: string }) {
  if (state.mode === "addition") {
    const other = state.splitTarget === "A" ? state.numberB : state.numberA;
    const target = state.splitTarget === "A" ? state.numberA : state.numberB;
    const give = 10 - other;
    const keep = target - give;
    return {
      correctSplit: [give, keep] as [number, number],
      tenFrameCount: other,
      looseDotsCount: target,
    };
  }
  // Subtraction: e.g., 14 - 6
  // Split subtrahend (numberB) to first remove excess over 10, then remainder
  const dropTo10 = state.numberA - 10;
  const remaining = state.numberB - dropTo10;
  return {
    correctSplit: [dropTo10, remaining] as [number, number],
    tenFrameCount: 10, // start full
    looseDotsCount: dropTo10, // the ones part above 10
  };
}

// ── Component ──────────────────────────────────────────

interface SplitTreeAdderProps {
  data: SplitTreeProblem;
  onComplete: (result: ActivityResult) => void;
}

export function SplitTreeAdder({ data, onComplete }: SplitTreeAdderProps) {
  const { audio } = useApp();
  const [state, dispatch] = useReducer(reducer, data, initState);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 100, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Auto-advance timers
  useEffect(() => {
    if (state.phase === "show-problem") {
      timerRef.current = setTimeout(() => dispatch({ type: "AUTO_ADVANCE" }), 1500);
      return () => clearTimeout(timerRef.current);
    }
    if (state.phase === "split-open") {
      timerRef.current = setTimeout(() => dispatch({ type: "AUTO_ADVANCE" }), 600);
      return () => clearTimeout(timerRef.current);
    }
    if (state.phase === "ten-complete") {
      audio.playEffect("ding");
      timerRef.current = setTimeout(() => dispatch({ type: "AUTO_ADVANCE" }), 1200);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, audio]);

  // Check ten-frame full after drag
  useEffect(() => {
    if (state.phase === "drag-to-ten" && state.tenFrameCount === 10) {
      timerRef.current = setTimeout(() => dispatch({ type: "TEN_FRAME_FULL" }), 300);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.tenFrameCount, state.phase]);

  // Celebrate → onComplete
  useEffect(() => {
    if (state.phase === "celebrate") {
      audio.playEffect("stars-earned");
      timerRef.current = setTimeout(() => {
        onComplete({
          activityId: `${data.numberA}${data.mode === "addition" ? "+" : "-"}${data.numberB}`,
          correct: true,
          attempts: state.mistakes + 1,
          timeMs: Date.now() - state.startTime,
          score: Math.max(0, 100 - state.mistakes * 15),
        });
      }, 1500);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.mistakes, state.startTime, data, onComplete, audio]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.over?.id.toString().startsWith("frame-slot-")) {
        dispatch({ type: "DRAG_DOT_TO_FRAME" });
        audio.playEffect("pop");
      }
    },
    [audio],
  );

  const handleSubmitSplit = useCallback(() => {
    dispatch({ type: "CONFIRM_SPLIT" });
  }, []);

  const handleSubmitFinal = useCallback(() => {
    const value = parseInt(state.inputBuffer, 10);
    if (isNaN(value)) return;
    if (value === data.expectedAnswer) {
      dispatch({ type: "SUBMIT_FINAL", answer: value });
      audio.playEffect("correct");
      setTimeout(() => dispatch({ type: "CELEBRATE" }), 500);
    } else {
      dispatch({ type: "WRONG_ANSWER" });
      audio.playEffect("try-again");
    }
  }, [state.inputBuffer, data.expectedAnswer, audio]);

  const op = data.mode === "addition" ? "+" : "−";
  const otherNum = state.splitTarget === "A" ? state.numberB : state.numberA;
  const targetNum = state.splitTarget === "A" ? state.numberA : state.numberB;
  const remainder = state.correctSplit ? state.correctSplit[1] : 0;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 p-4">
        {/* Equation bar */}
        <EquationBar
          phase={state.phase}
          numberA={state.numberA}
          numberB={state.numberB}
          op={op}
          expectedAnswer={data.expectedAnswer}
          otherNum={otherNum}
          remainder={remainder}
        />

        {/* Number cards + split tree */}
        {(state.phase === "choose-split" ||
          state.phase === "split-open" ||
          state.phase === "fill-split") && (
          <div className="flex flex-col items-center gap-4">
            {/* Number cards row */}
            {state.phase === "choose-split" && (
              <>
                <p className="text-lg font-medium text-gray-600">
                  Which number do you want to split?
                </p>
                <div className="flex items-center gap-8">
                  <NumberCard
                    value={state.numberA}
                    pulsing
                    onClick={() => dispatch({ type: "CHOOSE_SPLIT", target: "A" })}
                  />
                  <span className="text-3xl font-bold text-gray-400">{op}</span>
                  <NumberCard
                    value={state.numberB}
                    pulsing
                    onClick={() => dispatch({ type: "CHOOSE_SPLIT", target: "B" })}
                  />
                </div>
              </>
            )}

            {/* Split tree visualization */}
            {(state.phase === "split-open" || state.phase === "fill-split") &&
              state.correctSplit && (
                <SplitTree
                  targetNum={targetNum}
                  splitValues={state.splitValues}
                  correctSplit={state.correctSplit}
                  phase={state.phase}
                  activeSplitIndex={state.activeSplitIndex}
                  inputBuffer={state.inputBuffer}
                />
              )}
          </div>
        )}

        {/* Ten-frame */}
        {state.phase !== "show-problem" && state.phase !== "choose-split" && (
          <div className="flex flex-col items-center gap-3">
            <TenFrame
              filledCount={Math.min(state.tenFrameCount, 10)}
              filledColor={data.mode === "addition" ? "#ef4444" : "#ef4444"}
              emptySlots
              droppable={state.phase === "drag-to-ten"}
              size="md"
            />

            {/* Loose dots */}
            {state.phase === "drag-to-ten" && state.looseDotsCount > 0 && (
              <div className="mt-2">
                <DraggableDots
                  count={state.looseDotsCount}
                  color="#3b82f6"
                  highlightGroup={0}
                  groups={[state.looseDotsCount, 0]}
                />
              </div>
            )}

            {/* Remaining dots after ten-frame full */}
            {(state.phase === "ten-complete" || state.phase === "final-answer" || state.phase === "celebrate") &&
              remainder > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="mr-2 text-sm text-gray-400">+{remainder}</span>
                  <DraggableDots count={remainder} color="#3b82f6" />
                </div>
              )}
          </div>
        )}

        {/* Drag prompt */}
        {state.phase === "drag-to-ten" && (
          <p className="text-lg text-blue-600">
            Drag the dots to fill the ten-frame!
          </p>
        )}

        {/* Ten-complete celebration */}
        {state.phase === "ten-complete" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-4xl font-bold text-amber-500"
          >
            10!
          </motion.div>
        )}

        {/* Hint */}
        {state.showHint && state.phase === "fill-split" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-amber-600"
          >
            💡 What number plus {otherNum} equals 10?
          </motion.p>
        )}

        {state.showHint && state.phase === "final-answer" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-amber-600"
          >
            💡 Count {Math.min(state.tenFrameCount, 10)} + {remainder}
          </motion.p>
        )}

        {/* Number pad for fill-split and final-answer */}
        {(state.phase === "fill-split" || state.phase === "final-answer") && (
          <NumberPad
            inputBuffer={state.inputBuffer}
            showTeenRow={state.phase === "final-answer"}
            onTap={(n) => dispatch({ type: "TAP_NUMBER", digit: n })}
            onSetBuffer={(v) => dispatch({ type: "SET_BUFFER", value: v })}
            onBackspace={() => dispatch({ type: "BACKSPACE" })}
            onSubmit={
              state.phase === "fill-split" ? handleSubmitSplit : handleSubmitFinal
            }
          />
        )}

        {/* Celebrate */}
        <AnimatePresence>
          {state.phase === "celebrate" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl bg-green-100 p-8 text-center"
            >
              <p className="text-5xl">🌟</p>
              <p className="mt-2 text-3xl font-bold text-green-700">!أحسنت</p>
              <p className="text-xl text-green-600">Well done!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}

// ── Sub-components ─────────────────────────────────────

function EquationBar({
  phase,
  numberA,
  numberB,
  op,
  expectedAnswer,
  remainder,
}: {
  phase: Phase;
  numberA: number;
  numberB: number;
  op: string;
  expectedAnswer: number;
  otherNum: number;
  remainder: number;
}) {
  const showFinal =
    phase === "ten-complete" ||
    phase === "final-answer" ||
    phase === "celebrate";

  return (
    <motion.div
      layout
      className="w-full rounded-2xl bg-blue-50 p-5 text-center"
    >
      <AnimatePresence mode="wait">
        {showFinal ? (
          <motion.p
            key="final"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-blue-700"
          >
            <span className="text-amber-500">10</span> {op}{" "}
            {remainder} ={" "}
            {phase === "celebrate" ? (
              <span className="text-green-600">{expectedAnswer}</span>
            ) : (
              <span className="inline-block w-12 rounded border-b-2 border-blue-400">
                ?
              </span>
            )}
          </motion.p>
        ) : (
          <motion.p
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-blue-700"
          >
            {numberA} {op} {numberB} ={" "}
            <span className="inline-block w-12 rounded border-b-2 border-blue-400">
              ?
            </span>
          </motion.p>
        )}
      </AnimatePresence>
      {/* Show the "other" number context for subtraction final */}
      {showFinal && phase !== "celebrate" && op === "−" && (
        <p className="mt-1 text-sm text-gray-400">
          ({numberA} {op} {numberB})
        </p>
      )}
    </motion.div>
  );
}

function NumberCard({
  value,
  pulsing,
  onClick,
}: {
  value: number;
  pulsing: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      animate={pulsing ? { scale: [1, 1.08, 1] } : {}}
      transition={pulsing ? { repeat: Infinity, duration: 1.5 } : {}}
      onClick={onClick}
      className="flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-blue-400 bg-white text-4xl font-bold text-blue-700 shadow-md active:scale-95"
    >
      {value}
    </motion.button>
  );
}

function SplitTree({
  targetNum,
  splitValues,
  correctSplit,
  phase,
  activeSplitIndex,
  inputBuffer,
}: {
  targetNum: number;
  splitValues: [number | null, number | null];
  correctSplit: [number, number];
  phase: "split-open" | "fill-split";
  activeSplitIndex: 0 | 1;
  inputBuffer: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-2"
      style={{ transformOrigin: "top center" }}
    >
      {/* Target number */}
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl font-bold text-blue-700">
        {targetNum}
      </div>

      {/* SVG branch lines */}
      <svg width="120" height="40" viewBox="0 0 120 40" className="text-gray-400">
        <motion.line
          x1="60" y1="0" x2="25" y2="40"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.line
          x1="60" y1="0" x2="95" y2="40"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      </svg>

      {/* Split value nodes */}
      <div className="flex gap-12">
        <SplitNode
          value={splitValues[0]}
          correct={correctSplit[0]}
          isActive={phase === "fill-split" && activeSplitIndex === 0}
          isCompleted={splitValues[0] !== null}
          inputBuffer={activeSplitIndex === 0 ? inputBuffer : ""}
        />
        <SplitNode
          value={splitValues[1]}
          correct={correctSplit[1]}
          isActive={phase === "fill-split" && activeSplitIndex === 1}
          isCompleted={splitValues[1] !== null}
          inputBuffer={activeSplitIndex === 1 ? inputBuffer : ""}
        />
      </div>
    </motion.div>
  );
}

function SplitNode({
  value,
  correct: _correct,
  isActive,
  isCompleted,
  inputBuffer,
}: {
  value: number | null;
  correct: number;
  isActive: boolean;
  isCompleted: boolean;
  inputBuffer: string;
}) {
  const display = value !== null ? String(value) : inputBuffer || "";
  const border = isCompleted
    ? "border-green-500 bg-green-50"
    : isActive
      ? "border-blue-500 bg-blue-50 animate-pulse"
      : "border-gray-300 bg-white";

  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full border-3 text-xl font-bold ${border}`}
    >
      {display || (isActive ? "_" : "")}
    </div>
  );
}

// ── Number Pad (shared pattern from GuidedBoxFill) ─────

function NumberPad({
  inputBuffer,
  showTeenRow,
  onTap,
  onSetBuffer,
  onBackspace,
  onSubmit,
}: {
  inputBuffer: string;
  showTeenRow: boolean;
  onTap: (n: number) => void;
  onSetBuffer: (value: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <PadBtn key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {[6, 7, 8, 9, 0].map((n) => (
          <PadBtn key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
        <PadBtn label="⌫" onPress={onBackspace} variant="secondary" />
      </div>
      {showTeenRow && (
        <div className="flex justify-center gap-2">
          {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((n) => (
            <PadBtn
              key={n}
              label={String(n)}
              onPress={() => onSetBuffer(String(n))}
              size="sm"
            />
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!inputBuffer}
          className="min-h-14 min-w-32 rounded-xl bg-blue-600 px-8 py-3 text-xl font-bold text-white shadow-md transition active:scale-95 disabled:bg-gray-300"
        >
          ✓ Check
        </button>
      </div>
    </div>
  );
}

function PadBtn({
  label,
  onPress,
  variant = "primary",
  size = "md",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
}) {
  const base =
    size === "sm"
      ? "min-h-12 min-w-10 text-lg rounded-lg"
      : "min-h-14 min-w-14 text-2xl rounded-xl";
  const colors =
    variant === "secondary"
      ? "bg-gray-200 text-gray-700"
      : "bg-white text-gray-900 border border-gray-200 shadow-sm";

  return (
    <button
      onClick={onPress}
      className={`font-bold transition active:scale-90 ${base} ${colors}`}
    >
      {label}
    </button>
  );
}
