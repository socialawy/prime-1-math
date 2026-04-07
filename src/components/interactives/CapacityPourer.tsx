import { useEffect, useReducer, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type { ActivityResult, CapacityData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

interface CapacityState {
  phase: "measuring" | "answering" | "celebrate";
  userCounts: Record<string, number | null>;
  activeField: string | "difference";
  inputBuffer: string;
  userOrder: string[];
  wrongField: string | null;
  mistakes: number;
  startTime: number;
}

type CapacityAction =
  | { type: "TAP_FIELD"; field: string | "difference" }
  | { type: "TAP_NUMBER"; digit: number }
  | { type: "BACKSPACE" }
  | { type: "CHECK_COUNTS" }
  | { type: "CHOOSE_CONTAINER"; id: string }
  | { type: "SET_ORDER"; ids: string[] }
  | { type: "CHECK_ORDER" }
  | { type: "SUBMIT_DIFFERENCE" }
  | { type: "CLEAR_WRONG" };

function getMode(data: CapacityData): NonNullable<CapacityData["mode"]> {
  return data.mode ?? "compare-two";
}

function initState(data: CapacityData): CapacityState {
  const mode = getMode(data);
  return {
    phase: mode === "count-cups" ? "measuring" : "answering",
    userCounts: Object.fromEntries(
      data.containers.map((container) => [container.id ?? container.label, null]),
    ) as Record<string, number | null>,
    activeField: data.containers[0]?.id ?? data.containers[0]?.label ?? "difference",
    inputBuffer: "",
    userOrder: data.containers.map((container) => container.id ?? container.label),
    wrongField: null,
    mistakes: 0,
    startTime: Date.now(),
  };
}

function reducer(
  state: CapacityState,
  action: CapacityAction,
  data: CapacityData,
): CapacityState {
  const mode = getMode(data);

  switch (action.type) {
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
        const container = data.containers.find(
          (item) => (item.id ?? item.label) === state.activeField,
        );

        if (!container || container.capacityCups !== value) {
          return {
            ...state,
            userCounts: nextCounts,
            inputBuffer: "",
            wrongField: String(state.activeField),
            mistakes: state.mistakes + 1,
          };
        }

        state = { ...state, userCounts: nextCounts, inputBuffer: "", wrongField: null };
      }

      const allCorrect = data.containers.every(
        (container) =>
          state.userCounts[container.id ?? container.label] === container.capacityCups,
      );

      if (!allCorrect) {
        return {
          ...state,
          wrongField: String(state.activeField),
          mistakes: state.mistakes + 1,
        };
      }

      return mode === "count-cups"
        ? { ...state, phase: "celebrate", wrongField: null }
        : { ...state, phase: "answering", wrongField: null };
    }

    case "CHOOSE_CONTAINER": {
      const capacities = data.containers.map((container) => container.capacityCups);
      const expected =
        data.question === "which-less" ? Math.min(...capacities) : Math.max(...capacities);
      const chosen = data.containers.find((container) => (container.id ?? container.label) === action.id);
      if (!chosen || chosen.capacityCups !== expected) {
        return { ...state, wrongField: action.id, mistakes: state.mistakes + 1 };
      }
      return { ...state, phase: "celebrate", wrongField: null };
    }

    case "SET_ORDER":
      return { ...state, userOrder: action.ids };

    case "CHECK_ORDER": {
      const correctOrder =
        data.correctOrder ??
        [...data.containers]
          .sort((a, b) => a.capacityCups - b.capacityCups)
          .map((container) => container.id ?? container.label);
      const valid =
        correctOrder.length === state.userOrder.length &&
        correctOrder.every((id, index) => id === state.userOrder[index]);
      if (!valid) {
        return { ...state, wrongField: "order", mistakes: state.mistakes + 1 };
      }
      return { ...state, phase: "celebrate", wrongField: null };
    }

    case "SUBMIT_DIFFERENCE": {
      const value = parseInt(state.inputBuffer, 10);
      const expected =
        typeof data.correctAnswer === "number"
          ? data.correctAnswer
          : Math.abs(
              data.containers[0]!.capacityCups - data.containers[1]!.capacityCups,
            );
      if (Number.isNaN(value) || value !== expected) {
        return {
          ...state,
          inputBuffer: "",
          wrongField: "difference",
          mistakes: state.mistakes + 1,
        };
      }
      return { ...state, phase: "celebrate", inputBuffer: "", wrongField: null };
    }

    case "CLEAR_WRONG":
      return { ...state, wrongField: null };

    default:
      return state;
  }
}

interface CapacityPourerProps {
  data: CapacityData;
  onComplete: (result: ActivityResult) => void;
}

export function CapacityPourer({ data, onComplete }: CapacityPourerProps) {
  const { audio } = useApp();
  const [state, rawDispatch] = useReducer(
    (s: CapacityState, a: CapacityAction) => reducer(s, a, data),
    data,
    initState,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mode = getMode(data);
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 100, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

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
          activityId: `capacity-${mode}`,
          correct: true,
          attempts: state.mistakes + 1,
          timeMs: Date.now() - state.startTime,
          score: Math.max(0, 100 - state.mistakes * 10),
        });
      }, 1400);
      return () => clearTimeout(timerRef.current);
    }
  }, [state.phase, state.mistakes, state.startTime, mode, onComplete, audio]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.userOrder.indexOf(String(active.id));
    const newIndex = state.userOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    rawDispatch({ type: "SET_ORDER", ids: arrayMove(state.userOrder, oldIndex, newIndex) });
    audio.playEffect("pop");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center">
        <p className="text-lg font-medium text-blue-800">{getInstruction(data)}</p>
      </div>

      {mode === "order-multiple" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={state.userOrder} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-4 rounded-2xl bg-white p-4 shadow-sm">
              {state.userOrder.map((id) => {
                const container = data.containers.find((item) => (item.id ?? item.label) === id)!;
                const maxCups = Math.max(...data.containers.map((c) => c.capacityCups), 1);
                return <SortableContainerCard key={id} container={container} maxCups={maxCups} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3">
          {data.containers.map((container) => {
            const key = container.id ?? container.label;
            const maxCups = Math.max(...data.containers.map((c) => c.capacityCups), 1);
            return (
              <ContainerCard
                key={key}
                container={container}
                wrong={state.wrongField === key}
                countValue={state.userCounts[key] ?? null}
                countBuffer={state.activeField === key ? state.inputBuffer : ""}
                isActive={state.activeField === key}
                showInput={mode === "count-cups"}
                onChoose={() => rawDispatch({ type: "CHOOSE_CONTAINER", id: key })}
                onFocus={() => rawDispatch({ type: "TAP_FIELD", field: key })}
                maxCups={maxCups}
              />
            );
          })}
        </div>
      )}

      {mode === "count-cups" && (
        <>
          <div className="flex justify-center">
            <button
              onClick={() => rawDispatch({ type: "CHECK_COUNTS" })}
              className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow active:scale-95"
            >
              Check cups
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

      {mode === "order-multiple" && state.phase !== "celebrate" && (
        <div className="flex justify-center">
          <button
            onClick={() => rawDispatch({ type: "CHECK_ORDER" })}
            className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow active:scale-95"
          >
            Check order
          </button>
        </div>
      )}

      {mode === "difference" && state.phase !== "celebrate" && (
        <>
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">How many more cups?</p>
            <button
              onClick={() => rawDispatch({ type: "TAP_FIELD", field: "difference" })}
              className={`mt-2 rounded-xl px-6 py-3 text-3xl font-bold ${
                state.wrongField === "difference"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {state.inputBuffer || "_"}
            </button>
          </div>
          <NumberPad
            inputBuffer={state.inputBuffer}
            onTap={(digit) => rawDispatch({ type: "TAP_NUMBER", digit })}
            onBackspace={() => rawDispatch({ type: "BACKSPACE" })}
            onSubmit={() => rawDispatch({ type: "SUBMIT_DIFFERENCE" })}
          />
        </>
      )}

      {state.phase === "celebrate" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-green-100 px-8 py-6 text-center"
        >
          <p className="text-2xl font-bold text-green-700">Nice measuring!</p>
        </motion.div>
      )}
    </div>
  );
}

function getInstruction(data: CapacityData): string {
  const mode = getMode(data);
  if (mode === "count-cups") return "Count the cups for each container.";
  if (mode === "order-multiple") return "Arrange the containers from least to most cups.";
  if (mode === "difference") return "How many more cups does one container have?";
  return data.question === "which-less"
    ? "Tap the container that has less water."
    : "Tap the container that has more water.";
}

function ContainerCard({
  container,
  wrong,
  countValue,
  countBuffer,
  isActive,
  showInput,
  onChoose,
  onFocus,
  maxCups,
}: {
  container: CapacityData["containers"][number];
  wrong: boolean;
  countValue: number | null;
  countBuffer: string;
  isActive: boolean;
  showInput: boolean;
  onChoose: () => void;
  onFocus: () => void;
  maxCups: number;
}) {
  const display = countValue !== null ? String(countValue) : countBuffer || (isActive ? "_" : "");
  const fillPct = maxCups > 0 ? Math.round((container.capacityCups / maxCups) * 100) : 0;
  const friendlyLabel = humanizeLabel(container.label);

  return (
    <button
      onClick={showInput ? onFocus : onChoose}
      className={`rounded-2xl border-2 p-4 text-center shadow-sm ${
        wrong
          ? "border-red-300 bg-red-50"
          : isActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-gray-600">{friendlyLabel}</p>
      {/* Container with liquid fill */}
      <div className="mx-auto mt-3 flex justify-center">
        <svg viewBox="0 0 60 90" className="h-28 w-16" aria-label={`${friendlyLabel}: ${container.capacityCups} cups`}>
          {/* Container outline */}
          <rect x="8" y="8" width="44" height="72" rx="6" ry="6"
            fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          {/* Liquid fill */}
          <rect x="10" y={10 + 68 * (1 - fillPct / 100)} width="40"
            height={68 * (fillPct / 100)} rx="4" ry="4"
            fill="#38bdf8" opacity="0.7" />
          {/* Cup tick marks */}
          {Array.from({ length: maxCups }, (_, i) => {
            const y = 78 - (68 / maxCups) * (i + 1) + 68 / maxCups / 2;
            return i < container.capacityCups ? (
              <line key={i} x1="14" y1={y} x2="22" y2={y}
                stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            ) : null;
          })}
        </svg>
      </div>
      {showInput ? (
        <div className="mt-3 rounded-xl bg-white px-4 py-2 text-2xl font-bold text-blue-700">
          {display}
        </div>
      ) : null}
    </button>
  );
}

function SortableContainerCard({
  container,
  maxCups,
}: {
  container: CapacityData["containers"][number];
  maxCups: number;
}) {
  const id = container.id ?? container.label;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const fillPct = maxCups > 0 ? Math.round((container.capacityCups / maxCups) * 100) : 0;
  const friendlyLabel = humanizeLabel(container.label);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-44 touch-none rounded-2xl border-2 border-gray-200 bg-white p-4 text-center shadow-sm"
    >
      <p className="text-sm font-medium text-gray-600">{friendlyLabel}</p>
      <div className="mx-auto mt-3 flex justify-center">
        <svg viewBox="0 0 60 90" className="h-28 w-16" aria-label={`${friendlyLabel}: ${container.capacityCups} cups`}>
          <rect x="8" y="8" width="44" height="72" rx="6" ry="6"
            fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <rect x="10" y={10 + 68 * (1 - fillPct / 100)} width="40"
            height={68 * (fillPct / 100)} rx="4" ry="4"
            fill="#38bdf8" opacity="0.7" />
          {Array.from({ length: maxCups }, (_, i) => {
            const y = 78 - (68 / maxCups) * (i + 1) + 68 / maxCups / 2;
            return i < container.capacityCups ? (
              <line key={i} x1="14" y1={y} x2="22" y2={y}
                stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            ) : null;
          })}
        </svg>
      </div>
    </div>
  );
}

/** Convert raw flash data labels (e.g., "brown-clay", "green") into child-friendly names. */
function humanizeLabel(label: string): string {
  const map: Record<string, string> = {
    "green": "Container A",
    "orange": "Container B",
    "brown-clay": "Container C",
    "blue": "Container D",
    "red": "Container E",
  };
  return map[label.toLowerCase()] ?? label;
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
