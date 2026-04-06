import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, MixedWordProblemData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

interface WordProblemProps {
  data: MixedWordProblemData;
  onComplete: (result: ActivityResult) => void;
}

export function WordProblem({ data, onComplete }: WordProblemProps) {
  const { audio } = useApp();
  const [selectedOp, setSelectedOp] = useState<"+" | "-" | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [wrongReason, setWrongReason] = useState<"operation" | "answer" | null>(null);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());

  const [operandA, operandB] = data.operands;
  const emoji = useMemo(() => iconForItem(data.imageId), [data.imageId]);

  useEffect(() => {
    if (!completed) return;
    audio.playEffect("stars-earned");
    const timer = setTimeout(() => {
      onComplete({
        activityId: `word-problem-${data.operation}-${operandA}-${operandB}`,
        correct: true,
        attempts: mistakes + 1,
        timeMs: Date.now() - startTime,
        score: Math.max(0, 100 - mistakes * 12),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [completed, audio, onComplete, data.operation, operandA, operandB, mistakes, startTime]);

  const checkAnswer = () => {
    const typedAnswer = parseInt(answerInput, 10);
    const opCorrect = selectedOp === data.operation;
    const answerCorrect = !Number.isNaN(typedAnswer) && typedAnswer === data.correctAnswer;

    if (opCorrect && answerCorrect) {
      setCompleted(true);
      audio.playEffect("correct");
      return;
    }

    setMistakes((count) => count + 1);
    setWrongReason(!opCorrect ? "operation" : "answer");
    audio.playEffect("try-again");
    setTimeout(() => setWrongReason(null), 900);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-100 px-4 py-3 text-4xl">
            {emoji}
          </div>
          <div>
            <p className="text-2xl font-medium leading-relaxed text-slate-800">
              {data.storyEn}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-blue-50 p-6 shadow-sm">
        <p className="mb-4 text-center text-lg font-medium text-blue-800">
          Mathematical sentence
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-bold text-slate-800">
          <span className="rounded-xl bg-white px-4 py-3 shadow-sm">{operandA}</span>
          <button
            onClick={() => setSelectedOp("+")}
            className={`min-w-16 rounded-xl px-4 py-3 shadow-sm ${
              selectedOp === "+"
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-700"
            } ${wrongReason === "operation" && selectedOp === "+" && data.operation !== "+" ? "ring-2 ring-red-300" : ""}`}
          >
            +
          </button>
          <button
            onClick={() => setSelectedOp("-")}
            className={`min-w-16 rounded-xl px-4 py-3 shadow-sm ${
              selectedOp === "-"
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-700"
            } ${wrongReason === "operation" && selectedOp === "-" && data.operation !== "-" ? "ring-2 ring-red-300" : ""}`}
          >
            -
          </button>
          <span className="rounded-xl bg-white px-4 py-3 shadow-sm">{operandB}</span>
          <span>=</span>
          <button
            onClick={() => undefined}
            className={`min-w-20 rounded-xl px-4 py-3 shadow-sm ${
              wrongReason === "answer" ? "bg-red-50 text-red-700" : "bg-white text-blue-700"
            }`}
          >
            {answerInput || "_"}
          </button>
        </div>
      </div>

      {wrongReason === "operation" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-amber-100 px-5 py-4 text-center text-amber-800"
        >
          Read the story again. Did the person get more or give away?
        </motion.div>
      )}

      {wrongReason === "answer" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-amber-100 px-5 py-4 text-center text-amber-800"
        >
          Try the number sentence again and count carefully.
        </motion.div>
      )}

      {!completed && (
        <>
          <NumberPad
            inputBuffer={answerInput}
            onTap={(digit) => setAnswerInput((prev) => `${prev}${digit}`.slice(0, 2))}
            onBackspace={() => setAnswerInput((prev) => prev.slice(0, -1))}
            onSubmit={checkAnswer}
          />
        </>
      )}

      {completed && (
        <div className="rounded-2xl bg-green-100 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-green-700">Great problem solving!</p>
        </div>
      )}
    </div>
  );
}

function iconForItem(imageId: string): string {
  if (imageId.includes("apple")) return "🍎";
  if (imageId.includes("book")) return "📚";
  if (imageId.includes("bird")) return "🐦";
  if (imageId.includes("pencil")) return "✏️";
  if (imageId.includes("star")) return "⭐";
  return "📘";
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
