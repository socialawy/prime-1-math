import { useEffect, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, NumberLineData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

interface NumberLineState {
  phase: "filling" | "celebrate";
  currentBlankIndex: number;
  filledValues: Record<number, number | null>;
  inputBuffer: string;
  wrongPoint: number | null;
  mistakes: number;
  startTime: number;
}

type NumberLineAction =
  | { type: "TAP_POINT"; point: number }
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" }
  | { type: "CLEAR_WRONG" };

function buildPoints(data: NumberLineData): number[] {
  const points: number[] = [];
  for (let value = data.rangeStart; value <= data.rangeEnd; value += data.jumpSize) {
    points.push(value);
  }
  return points;
}

function initState(data: NumberLineData): NumberLineState {
  const filledValues: Record<number, number | null> = {};
  for (const point of data.missingPoints) filledValues[point] = null;
  return {
    phase: "filling",
    currentBlankIndex: 0,
    filledValues,
    inputBuffer: "",
    wrongPoint: null,
    mistakes: 0,
    startTime: Date.now(),
  };
}

function reducer(
  state: NumberLineState,
  action: NumberLineAction,
  data: NumberLineData,
): NumberLineState {
  switch (action.type) {
    case "TAP_POINT": {
      const nextIndex = data.missingPoints.findIndex((point) => point === action.point);
      if (nextIndex === -1) return state;
      return { ...state, currentBlankIndex: nextIndex, inputBuffer: "" };
    }

    case "TAP_NUMBER": {
      const next = state.inputBuffer + String(action.digit);
      if (next.length > 3) return state;
      return { ...state, inputBuffer: next };
    }

    case "BACKSPACE":
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) };

    case "SUBMIT": {
      const currentPoint = data.missingPoints[state.currentBlankIndex];
      if (currentPoint == null || state.inputBuffer === "") return state;
      const value = parseInt(state.inputBuffer, 10);
      if (value !== currentPoint) {
        return {
          ...state,
          inputBuffer: "",
          wrongPoint: currentPoint,
          mistakes: state.mistakes + 1,
        };
      }

      const filledValues = { ...state.filledValues, [currentPoint]: value };
      const done = data.missingPoints.every((point) => filledValues[point] !== null);
      if (done) {
        return { ...state, filledValues, inputBuffer: "", phase: "celebrate" };
      }

      return {
        ...state,
        filledValues,
        inputBuffer: "",
        currentBlankIndex: state.currentBlankIndex + 1,
        wrongPoint: null,
      };
    }

    case "CLEAR_WRONG":
      return { ...state, wrongPoint: null };

    default:
      return state;
  }
}

interface NumberLineProps {
  data: NumberLineData;
  onComplete: (result: ActivityResult) => void;
}

export function NumberLine({ data, onComplete }: NumberLineProps) {
  const { audio } = useApp();
  const [state, rawDispatch] = useReducer(
    (s: NumberLineState, a: NumberLineAction) => reducer(s, a, data),
    data,
    initState,
  );
  const pointRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const points = buildPoints(data);
  const currentPoint = data.missingPoints[state.currentBlankIndex] ?? null;

  useEffect(() => {
    if (currentPoint != null) {
      pointRefs.current[currentPoint]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentPoint]);

  useEffect(() => {
    if (state.wrongPoint != null) {
      audio.playEffect("try-again");
      timerRef.current = setTimeout(() => rawDispatch({ type: "CLEAR_WRONG" }), 400);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.wrongPoint, audio]);

  useEffect(() => {
    if (state.phase === "celebrate") {
      audio.playEffect("stars-earned");
      timerRef.current = setTimeout(() => {
        onComplete({
          activityId: `number-line-${data.jumpSize}-${data.rangeEnd}`,
          correct: true,
          attempts: state.mistakes + 1,
          timeMs: Date.now() - state.startTime,
          score: Math.max(0, 100 - state.mistakes * 10),
        });
      }, 1400);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.mistakes, state.startTime, data.jumpSize, data.rangeEnd, onComplete, audio]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center">
        <p className="text-lg font-medium text-blue-800">
          Complete the number line by jumping {data.jumpSize}s.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <div className="relative mx-auto min-w-max px-4 pb-8">
          <div className="absolute left-0 right-0 top-16 h-1 rounded bg-gray-300" />
          <div className="relative flex gap-8">
            {points.map((point, index) => {
              const isBlank = data.missingPoints.includes(point);
              const filled = state.filledValues[point];
              const isActive = currentPoint === point;
              const isWrong = state.wrongPoint === point;

              return (
                <div key={point} className="relative flex flex-col items-center">
                  {index > 0 && data.showJumpArrows !== false && (
                    <div className="pointer-events-none absolute -left-8 top-[-12px] flex w-8 justify-center text-xs font-bold text-blue-600">
                      <span>+{data.jumpSize}</span>
                    </div>
                  )}

                  <motion.button
                    ref={(node) => {
                      pointRefs.current[point] = node;
                    }}
                    animate={isWrong ? { y: [0, -4, 0], x: [0, -3, 3, 0] } : {}}
                    onClick={isBlank ? () => rawDispatch({ type: "TAP_POINT", point }) : undefined}
                    className={`z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-lg font-bold shadow-sm ${
                      isWrong
                        ? "border-red-400 bg-red-50 text-red-700"
                        : isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : filled !== null
                            ? "border-green-400 bg-green-50 text-green-700"
                            : isBlank
                              ? "border-blue-300 bg-white text-gray-500"
                              : "border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    {isBlank ? filled ?? (isActive ? state.inputBuffer || "_" : "_") : point}
                  </motion.button>
                  <div className="mt-4 h-4 w-1 rounded bg-gray-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {state.phase === "celebrate" ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-green-100 px-8 py-6 text-center"
        >
          <p className="text-4xl">Frog hop!</p>
          <p className="mt-2 text-2xl font-bold text-green-700">Nice hopping!</p>
        </motion.div>
      ) : (
        <NumberPad
          inputBuffer={state.inputBuffer}
          onTap={(digit) => rawDispatch({ type: "TAP_NUMBER", digit })}
          onBackspace={() => rawDispatch({ type: "BACKSPACE" })}
          onSubmit={() => rawDispatch({ type: "SUBMIT" })}
        />
      )}
    </div>
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
      </div>
      <div className="flex gap-2">
        <PadButton label="⌫" onPress={onBackspace} variant="secondary" />
        <button
          onClick={onSubmit}
          disabled={!inputBuffer}
          className="min-h-14 min-w-32 rounded-xl bg-blue-600 px-8 py-3 text-xl font-bold text-white shadow-md active:scale-95 disabled:bg-gray-300"
        >
          Check
        </button>
      </div>
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
