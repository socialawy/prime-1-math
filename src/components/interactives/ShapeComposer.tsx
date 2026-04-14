import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, ComposeShapesData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";
import { Shape2DSVG, type Shape2DKind } from "../shared/Shape2DSVG";

interface ShapeComposerProps {
  data: ComposeShapesData;
  onComplete: (result: ActivityResult) => void;
}

export function ShapeComposer({ data, onComplete }: ShapeComposerProps) {
  const { audio } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());

  const options = data.options ?? [];
  const correctId = data.correctOptionId ?? options[0]?.id;

  useEffect(() => {
    if (!completed) return;
    audio.playEffect("stars-earned");
    const timer = setTimeout(() => {
      onComplete({
        activityId: `shape-composer-${data.targetShape}`,
        correct: true,
        attempts: mistakes + 1,
        timeMs: Date.now() - startTime,
        score: Math.max(0, 100 - mistakes * 12),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [completed, audio, onComplete, data.targetShape, mistakes, startTime]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center text-lg font-medium text-blue-800">
        Use the pieces to make {data.targetDescription ?? `a ${data.targetShape}`}.
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-10 py-8 text-center">
            <Shape2DSVG shape={toShape2DKind(data.targetShape)} className="mx-auto h-28 w-28" />
            <p className="mt-3 text-xl font-bold text-slate-800">{titleize(data.targetShape)}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <motion.button
              key={option.id}
              animate={wrongId === option.id ? { x: [0, -4, 4, -4, 0] } : {}}
              onClick={() => {
                if (completed) return;
                if (option.id === correctId) {
                  setSelectedId(option.id);
                  setCompleted(true);
                  audio.playEffect("correct");
                } else {
                  setWrongId(option.id);
                  setMistakes((count) => count + 1);
                  audio.playEffect("try-again");
                  setTimeout(() => setWrongId(null), 350);
                }
              }}
              className={`rounded-2xl border-2 p-4 text-center shadow-sm transition active:scale-95 ${
                selectedId === option.id
                  ? "border-green-500 bg-green-50"
                  : wrongId === option.id
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex min-h-28 items-center justify-center gap-3">
                {option.pieces.map((piece, index) => (
                  <Shape2DSVG
                    key={`${option.id}-${piece}-${index}`}
                    shape={toRenderablePiece(piece)}
                    className="h-16 w-16"
                  />
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">{option.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {completed && (
        <div className="rounded-2xl bg-green-100 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-green-700">Nice combining!</p>
        </div>
      )}
    </div>
  );
}

function toShape2DKind(shape: string): Shape2DKind {
  if (shape === "square" || shape === "circle" || shape === "triangle" || shape === "rectangle") {
    return shape;
  }
  // All generator compositions should use valid 2D shapes.
  // Default to square (most neutral) if data is somehow invalid.
  return "square";
}

function toRenderablePiece(piece: string): Shape2DKind {
  return piece === "semicircle" ? "circle" : toShape2DKind(piece);
}

function titleize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
