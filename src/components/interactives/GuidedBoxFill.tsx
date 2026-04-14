import { useReducer, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  GuidedBoxProblem,
  GuidedStep,
  ActivityResult,
} from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

// ── State ──────────────────────────────────────────────

type StepStatus = "locked" | "info" | "active" | "correct" | "wrong";

interface BoxFillState {
  currentStepIndex: number;
  filledValues: Record<string, Record<number, number | null>>;
  stepStatus: Record<string, StepStatus>;
  attemptsPerStep: Record<string, number>;
  showHint: Record<string, boolean>;
  activeBlankIndex: number;
  inputBuffer: string;
  phase: "working" | "all-correct" | "celebrate";
  startTime: number;
  totalAttempts: number;
}

type BoxFillAction =
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "SET_BUFFER"; value: string }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" }
  | { type: "ADVANCE_INFO" }
  | { type: "CLEAR_WRONG"; stepId: string }
  | { type: "CELEBRATE" };

function initState(problem: GuidedBoxProblem): BoxFillState {
  const stepStatus: Record<string, string> = {};
  const filledValues: Record<string, Record<number, number | null>> = {};
  const attemptsPerStep: Record<string, number> = {};
  const showHint: Record<string, boolean> = {};

  problem.steps.forEach((step, i) => {
    if (i === 0) {
      stepStatus[step.id] = step.blanks.length === 0 ? "info" : "active";
    } else {
      stepStatus[step.id] = "locked";
    }
    filledValues[step.id] = {};
    step.blanks.forEach((b) => {
      filledValues[step.id]![b.index] = null;
    });
    attemptsPerStep[step.id] = 0;
    showHint[step.id] = false;
  });

  return {
    currentStepIndex: 0,
    filledValues: filledValues as Record<string, Record<number, number | null>>,
    stepStatus: stepStatus as Record<string, StepStatus>,
    attemptsPerStep,
    showHint,
    activeBlankIndex: 0,
    inputBuffer: "",
    phase: "working",
    startTime: Date.now(),
    totalAttempts: 0,
  };
}

function reducer(
  state: BoxFillState,
  action: BoxFillAction,
  problem: GuidedBoxProblem,
): BoxFillState {
  switch (action.type) {
    case "TAP_NUMBER": {
      const buf = state.inputBuffer + String(action.digit);
      // Cap at 2 digits (max answer is 18)
      if (buf.length > 2) return state;
      return { ...state, inputBuffer: buf };
    }

    case "SET_BUFFER": {
      if (action.value.length > 2) return state;
      return { ...state, inputBuffer: action.value };
    }

    case "BACKSPACE": {
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) };
    }

    case "SUBMIT": {
      if (state.inputBuffer === "") return state;

      const step = problem.steps[state.currentStepIndex]!;
      const blank = step.blanks[state.activeBlankIndex]!;
      const value = parseInt(state.inputBuffer, 10);
      const isCorrect = value === blank.correctValue;

      if (isCorrect) {
        // Fill the blank
        const newFilled = {
          ...state.filledValues,
          [step.id]: {
            ...state.filledValues[step.id],
            [blank.index]: value,
          },
        };

        const nextBlankIdx = state.activeBlankIndex + 1;

        // More blanks in this step?
        if (nextBlankIdx < step.blanks.length) {
          return {
            ...state,
            filledValues: newFilled,
            activeBlankIndex: nextBlankIdx,
            inputBuffer: "",
            totalAttempts: state.totalAttempts + 1,
          };
        }

        // Step complete — advance
        const newStepStatus = {
          ...state.stepStatus,
          [step.id]: "correct" as const,
        };

        const nextStepIdx = state.currentStepIndex + 1;

        // All steps done?
        if (nextStepIdx >= problem.steps.length) {
          return {
            ...state,
            filledValues: newFilled,
            stepStatus: newStepStatus,
            inputBuffer: "",
            phase: "all-correct",
            totalAttempts: state.totalAttempts + 1,
          };
        }

        // Unlock next step
        const nextStep = problem.steps[nextStepIdx]!;
        newStepStatus[nextStep.id] = nextStep.blanks.length === 0 ? "info" : "active";

        return {
          ...state,
          filledValues: newFilled,
          stepStatus: newStepStatus,
          currentStepIndex: nextStepIdx,
          activeBlankIndex: 0,
          inputBuffer: "",
          totalAttempts: state.totalAttempts + 1,
        };
      }

      // Wrong answer
      const newAttempts = {
        ...state.attemptsPerStep,
        [step.id]: (state.attemptsPerStep[step.id] ?? 0) + 1,
      };
      const shouldShowHint = (newAttempts[step.id] ?? 0) >= 2;

      return {
        ...state,
        stepStatus: { ...state.stepStatus, [step.id]: "wrong" },
        attemptsPerStep: newAttempts,
        showHint: { ...state.showHint, [step.id]: shouldShowHint },
        inputBuffer: "",
        totalAttempts: state.totalAttempts + 1,
      };
    }

    case "CLEAR_WRONG": {
      return {
        ...state,
        stepStatus: { ...state.stepStatus, [action.stepId]: "active" },
      };
    }

    case "ADVANCE_INFO": {
      const step = problem.steps[state.currentStepIndex]!;
      const newStepStatus = {
        ...state.stepStatus,
        [step.id]: "correct" as const,
      };
      const nextStepIdx = state.currentStepIndex + 1;

      if (nextStepIdx >= problem.steps.length) {
        return { ...state, stepStatus: newStepStatus, phase: "all-correct" };
      }

      const nextStep = problem.steps[nextStepIdx]!;
      newStepStatus[nextStep.id] = nextStep.blanks.length === 0 ? "info" : "active";

      return {
        ...state,
        stepStatus: newStepStatus,
        currentStepIndex: nextStepIdx,
        activeBlankIndex: 0,
        inputBuffer: "",
      };
    }

    case "CELEBRATE": {
      return { ...state, phase: "celebrate" };
    }

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────

interface GuidedBoxFillProps {
  data: GuidedBoxProblem;
  onComplete: (result: ActivityResult) => void;
}

export function GuidedBoxFill({ data, onComplete }: GuidedBoxFillProps) {
  const { audio } = useApp();
  const [state, rawDispatch] = useReducer(
    (s: BoxFillState, a: BoxFillAction) => reducer(s, a, data),
    data,
    initState,
  );
  const celebrateTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dispatch = useCallback(
    (action: BoxFillAction) => rawDispatch(action),
    [],
  );

  // Auto-advance info-only steps after 1.5s
  useEffect(() => {
    const currentStep = data.steps[state.currentStepIndex];
    if (currentStep && state.stepStatus[currentStep.id] === "info") {
      const t = setTimeout(() => dispatch({ type: "ADVANCE_INFO" }), 1500);
      return () => clearTimeout(t);
    }
  }, [state.currentStepIndex, state.stepStatus, data.steps, dispatch]);

  // Handle wrong → clear after flash
  useEffect(() => {
    const wrongStep = data.steps.find(
      (s) => state.stepStatus[s.id] === "wrong",
    );
    if (wrongStep) {
      audio.playEffect("try-again");
      const t = setTimeout(
        () => dispatch({ type: "CLEAR_WRONG", stepId: wrongStep.id }),
        400,
      );
      return () => clearTimeout(t);
    }
  }, [state.stepStatus, data.steps, dispatch, audio]);

  // Handle all-correct → celebrate
  useEffect(() => {
    if (state.phase === "all-correct") {
      audio.playEffect("correct");
      celebrateTimerRef.current = setTimeout(
        () => dispatch({ type: "CELEBRATE" }),
        500,
      );
      return () => clearTimeout(celebrateTimerRef.current);
    }
  }, [state.phase, dispatch, audio]);

  // Handle celebrate → onComplete
  useEffect(() => {
    if (state.phase === "celebrate") {
      audio.playEffect("stars-earned");
      const t = setTimeout(() => {
        onComplete({
          activityId: data.equation,
          correct: true,
          attempts: state.totalAttempts,
          timeMs: Date.now() - state.startTime,
          score: Math.max(
            0,
            100 - (state.totalAttempts - data.steps.length) * 10,
          ),
        });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.totalAttempts, state.startTime, data, onComplete, audio]);

  // Check if any active blank needs teen numbers
  const needsTeenRow = (() => {
    const step = data.steps[state.currentStepIndex];
    if (!step) return false;
    return step.blanks.some((b) => b.correctValue > 10);
  })();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-4">
      {/* Equation header */}
      <div className="rounded-2xl bg-blue-50 p-6 text-center">
        <p className="mb-1 text-lg text-gray-500">Let&apos;s calculate</p>
        <p className="text-5xl font-bold text-blue-700">{data.equation}</p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {data.steps.map((step) => (
            <StepRow
              key={step.id}
              step={step}
              status={state.stepStatus[step.id] ?? "locked"}
              filledValues={state.filledValues[step.id] ?? {}}
              activeBlankIndex={
                data.steps[state.currentStepIndex]?.id === step.id
                  ? state.activeBlankIndex
                  : -1
              }
              showHint={state.showHint[step.id] ?? false}
              inputBuffer={
                data.steps[state.currentStepIndex]?.id === step.id
                  ? state.inputBuffer
                  : ""
              }
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Celebrate overlay */}
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

      {/* Number pad — only show while working and current step has blanks */}
      {state.phase === "working" &&
        (data.steps[state.currentStepIndex]?.blanks.length ?? 0) > 0 && (
        <NumberPad
          onTap={(n) => dispatch({ type: "TAP_NUMBER", digit: n })}
          onSetBuffer={(v) => dispatch({ type: "SET_BUFFER", value: v })}
          onBackspace={() => dispatch({ type: "BACKSPACE" })}
          onSubmit={() => dispatch({ type: "SUBMIT" })}
          showTeenRow={needsTeenRow}
          hasInput={state.inputBuffer.length > 0}
        />
        )}
    </div>
  );
}

// ── Step Row ───────────────────────────────────────────

function StepRow({
  step,
  status,
  filledValues,
  activeBlankIndex,
  showHint,
  inputBuffer,
}: {
  step: GuidedStep;
  status: StepStatus;
  filledValues: Record<number, number | null>;
  activeBlankIndex: number;
  showHint: boolean;
  inputBuffer: string;
}) {
  const bgColor =
    status === "correct"
      ? "bg-green-100 border-green-400"
      : status === "wrong"
        ? "bg-red-50 border-red-400"
        : status === "info"
          ? "bg-amber-50 border-amber-300"
          : status === "active"
            ? "bg-white border-blue-500 border-2"
            : "bg-gray-100 border-gray-200";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-colors ${bgColor}`}
    >
      {status === "locked" ? (
        <p className="text-center text-gray-300">...</p>
      ) : status === "info" ? (
        <p className="text-xl font-medium leading-relaxed text-amber-800">
          <span className="mr-2">💡</span>
          {step.template}
        </p>
      ) : (
        <>
          <p className="text-xl font-medium leading-relaxed">
            {status === "correct" && (
              <span className="mr-2 text-green-600">&#x2713;</span>
            )}
            {renderTemplate(
              step.template,
              step.blanks,
              filledValues,
              activeBlankIndex,
              status,
              inputBuffer,
            )}
          </p>
          {showHint && status === "active" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-amber-600"
            >
              💡{" "}
              {step.blanks[activeBlankIndex]?.hint ?? "Think about it again!"}
            </motion.p>
          )}
        </>
      )}
    </motion.div>
  );
}

function renderTemplate(
  template: string,
  blanks: readonly { index: number; correctValue: number }[],
  filledValues: Record<number, number | null>,
  activeBlankIndex: number,
  status: string,
  inputBuffer: string,
): (string | React.ReactElement)[] {
  const parts: (string | React.ReactElement)[] = [];
  let remaining = template;
  let partKey = 0;

  while (remaining.length > 0) {
    const match = remaining.match(/\{(\d+)\}/);
    if (!match || match.index === undefined) {
      parts.push(remaining);
      break;
    }

    if (match.index > 0) {
      parts.push(remaining.slice(0, match.index));
    }

    const blankIdx = parseInt(match[1]!, 10);
    const blank = blanks.find((b) => b.index === blankIdx);
    const filled = filledValues[blankIdx];
    const isActive =
      status === "active" &&
      blanks.findIndex((b) => b.index === blankIdx) === activeBlankIndex;

    parts.push(
      <BlankBox
        key={`blank-${partKey++}`}
        value={filled ?? null}
        isActive={isActive}
        isCorrect={status === "correct"}
        isWrong={status === "wrong" && isActive}
        inputBuffer={isActive ? inputBuffer : ""}
        correctValue={blank?.correctValue}
      />,
    );

    remaining = remaining.slice(match.index + match[0].length);
  }

  return parts;
}

// ── Blank Box ──────────────────────────────────────────

function BlankBox({
  value,
  isActive,
  isCorrect,
  isWrong,
  inputBuffer,
  correctValue: _correctValue,
}: {
  value: number | null;
  isActive: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  inputBuffer: string;
  correctValue?: number;
}) {
  const display =
    value !== null ? String(value) : isActive && inputBuffer ? inputBuffer : "";

  const borderColor = isWrong
    ? "border-red-500 bg-red-50"
    : isActive
      ? "border-blue-500 bg-blue-50"
      : isCorrect
        ? "border-green-500 bg-green-50"
        : "border-gray-300 bg-white";

  return (
    <motion.span
      animate={isWrong ? { x: [0, -4, 4, -4, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={`mx-1 inline-flex h-10 w-12 items-center justify-center rounded-lg border-2 text-xl font-bold ${borderColor}`}
    >
      {display || (isActive ? <span className="animate-pulse">_</span> : "")}
    </motion.span>
  );
}

// ── Number Pad ─────────────────────────────────────────

function NumberPad({
  onTap,
  onSetBuffer,
  onBackspace,
  onSubmit,
  showTeenRow,
  hasInput,
}: {
  onTap: (n: number) => void;
  onSetBuffer: (value: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  showTeenRow: boolean;
  hasInput: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: 1-5 */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <PadButton key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
      </div>
      {/* Row 2: 6-0 */}
      <div className="flex justify-center gap-2">
        {[6, 7, 8, 9, 0].map((n) => (
          <PadButton key={n} label={String(n)} onPress={() => onTap(n)} />
        ))}
      </div>
      {/* Row 3: teen numbers (conditional) */}
      {showTeenRow && (
        <div className="flex justify-center gap-2">
          {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((n) => (
            <PadButton
              key={n}
              label={String(n)}
              onPress={() => onSetBuffer(String(n))}
              size="sm"
            />
          ))}
        </div>
      )}
      {/* Submit button & Backspace */}
      <div className="flex justify-center gap-2">
        <PadButton label="⌫" onPress={onBackspace} variant="secondary" />
        <button
          onClick={onSubmit}
          disabled={!hasInput}
          className="min-h-14 min-w-32 rounded-xl bg-blue-600 px-8 py-3 text-xl font-bold text-white shadow-md transition active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
        >
          ✓ Check
        </button>
      </div>
    </div>
  );
}

function PadButton({
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
