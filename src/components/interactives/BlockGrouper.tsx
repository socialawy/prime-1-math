import { useEffect, useReducer, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ActivityResult, PlaceValueData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

type CountField = "tens" | "ones" | "total";

interface GrouperState {
  phase: "grouping" | "counting" | "celebrate";
  groupedCount: number;
  activeField: CountField;
  inputBuffer: string;
  answers: Record<CountField, number | null>;
  wrongField: CountField | null;
  mistakes: number;
  startTime: number;
}

type GrouperAction =
  | { type: "MAKE_GROUP" }
  | { type: "TAP_FIELD"; field: CountField }
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" }
  | { type: "CLEAR_WRONG" };

function initState(data: PlaceValueData): GrouperState {
  const startsCounting = (data.mode ?? "group-then-count") === "count-only";
  return {
    phase: startsCounting ? "counting" : "grouping",
    groupedCount: startsCounting ? data.expectedTens : 0,
    activeField: "tens",
    inputBuffer: "",
    answers: { tens: null, ones: null, total: null },
    wrongField: null,
    mistakes: 0,
    startTime: Date.now(),
  };
}

function reducer(state: GrouperState, action: GrouperAction, data: PlaceValueData): GrouperState {
  switch (action.type) {
    case "MAKE_GROUP": {
      const nextGroups = Math.min(state.groupedCount + 1, data.expectedTens);
      return {
        ...state,
        groupedCount: nextGroups,
        phase: nextGroups >= data.expectedTens ? "counting" : "grouping",
        activeField: "tens",
        inputBuffer: "",
      };
    }

    case "TAP_FIELD":
      return { ...state, activeField: action.field, inputBuffer: "" };

    case "TAP_NUMBER": {
      const maxLength = state.activeField === "total" ? 2 : 1;
      const next = state.inputBuffer + String(action.digit);
      if (next.length > maxLength) return state;
      return { ...state, inputBuffer: next };
    }

    case "BACKSPACE":
      return { ...state, inputBuffer: state.inputBuffer.slice(0, -1) };

    case "SUBMIT": {
      if (state.inputBuffer === "") return state;
      const value = parseInt(state.inputBuffer, 10);
      const expected =
        state.activeField === "tens"
          ? data.expectedTens
          : state.activeField === "ones"
            ? data.expectedOnes
            : data.totalItems;

      if (value !== expected) {
        return {
          ...state,
          wrongField: state.activeField,
          inputBuffer: "",
          mistakes: state.mistakes + 1,
        };
      }

      const answers = { ...state.answers, [state.activeField]: value };
      const nextField =
        answers.tens === null ? "tens" : answers.ones === null ? "ones" : "total";

      return {
        ...state,
        answers,
        inputBuffer: "",
        activeField: nextField,
        phase:
          answers.tens !== null && answers.ones !== null && answers.total !== null
            ? "celebrate"
            : "counting",
        wrongField: null,
      };
    }

    case "CLEAR_WRONG":
      return { ...state, wrongField: null };

    default:
      return state;
  }
}

interface BlockGrouperProps {
  data: PlaceValueData;
  onComplete: (result: ActivityResult) => void;
}

export function BlockGrouper({ data, onComplete }: BlockGrouperProps) {
  const { audio } = useApp();
  const [state, rawDispatch] = useReducer(
    (s: GrouperState, a: GrouperAction) => reducer(s, a, data),
    data,
    initState,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const remainingLoose = data.totalItems - state.groupedCount * 10;
  const canGroup = remainingLoose >= 10 && state.phase === "grouping";

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
          activityId: `block-group-${data.totalItems}`,
          correct: true,
          attempts: state.mistakes + 1,
          timeMs: Date.now() - state.startTime,
          score: Math.max(0, 100 - state.mistakes * 10),
        });
      }, 1400);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.mistakes, state.startTime, data.totalItems, onComplete, audio]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center">
        <p className="text-lg text-blue-700">Count the items and group them into tens.</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-gray-500">Tens rods</p>
        <div className="flex min-h-20 flex-wrap gap-3">
          <AnimatePresence initial={false}>
            {Array.from({ length: state.groupedCount }, (_, index) => (
              <motion.div
                key={`rod-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 shadow-sm"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, dotIndex) => (
                    <span key={dotIndex} className="text-lg text-amber-700">
                      {getVisualSymbol(data.visualType)}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-gray-500">Loose items</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: remainingLoose }, (_, index) => (
            <motion.span
              key={`loose-${index}`}
              layout
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-lg text-sky-700"
            >
              {getVisualSymbol(data.visualType)}
            </motion.span>
          ))}
        </div>
      </div>

      {state.phase === "grouping" && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              rawDispatch({ type: "MAKE_GROUP" });
              audio.playEffect("pop");
            }}
            disabled={!canGroup}
            className="rounded-2xl bg-amber-500 px-6 py-4 text-lg font-bold text-white shadow active:scale-95 disabled:bg-gray-300"
          >
            Make a group of 10
          </button>
        </div>
      )}

      {state.phase !== "grouping" && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <AnswerField
              label="Groups of 10"
              value={state.answers.tens}
              isActive={state.activeField === "tens"}
              isWrong={state.wrongField === "tens"}
              buffer={state.activeField === "tens" ? state.inputBuffer : ""}
              onClick={() => rawDispatch({ type: "TAP_FIELD", field: "tens" })}
            />
            <AnswerField
              label="Ones left"
              value={state.answers.ones}
              isActive={state.activeField === "ones"}
              isWrong={state.wrongField === "ones"}
              buffer={state.activeField === "ones" ? state.inputBuffer : ""}
              onClick={() => rawDispatch({ type: "TAP_FIELD", field: "ones" })}
            />
            <AnswerField
              label="Total"
              value={state.answers.total}
              isActive={state.activeField === "total"}
              isWrong={state.wrongField === "total"}
              buffer={state.activeField === "total" ? state.inputBuffer : ""}
              onClick={() => rawDispatch({ type: "TAP_FIELD", field: "total" })}
            />
          </div>

          {state.phase === "celebrate" ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl bg-green-100 px-8 py-6 text-center"
            >
              <p className="text-4xl">10s + 1s</p>
              <p className="mt-2 text-2xl font-bold text-green-700">Well done!</p>
            </motion.div>
          ) : (
            <NumberPad
              inputBuffer={state.inputBuffer}
              onTap={(digit) => rawDispatch({ type: "TAP_NUMBER", digit })}
              onBackspace={() => rawDispatch({ type: "BACKSPACE" })}
              onSubmit={() => rawDispatch({ type: "SUBMIT" })}
            />
          )}
        </>
      )}
    </div>
  );
}

function getVisualSymbol(visualType: PlaceValueData["visualType"]): string {
  if (visualType === "stars") return "★";
  if (visualType === "blocks") return "■";
  return "●";
}

function AnswerField({
  label,
  value,
  isActive,
  isWrong,
  buffer,
  onClick,
}: {
  label: string;
  value: number | null;
  isActive: boolean;
  isWrong: boolean;
  buffer: string;
  onClick: () => void;
}) {
  const display = value !== null ? String(value) : buffer || (isActive ? "_" : "");
  const styles = isWrong
    ? "border-red-400 bg-red-50"
    : isActive
      ? "border-blue-500 bg-blue-50"
      : value !== null
        ? "border-green-400 bg-green-50"
        : "border-gray-200 bg-white";

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left shadow-sm ${styles}`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{display}</p>
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
