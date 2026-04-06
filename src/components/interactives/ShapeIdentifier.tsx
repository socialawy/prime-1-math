import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, ShapeIdentifyData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";
import { Shape3DSVG, type Shape3DKind } from "../shared/Shape3DSVG";

interface ShapeIdentifierProps {
  data: ShapeIdentifyData;
  onComplete: (result: ActivityResult) => void;
}

export function ShapeIdentifier({ data, onComplete }: ShapeIdentifierProps) {
  const { audio } = useApp();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());

  const mode = useMemo(() => {
    const targetCount = data.options.filter((shape) => shape === data.targetShape).length;
    return targetCount >= 2 ? "odd-one-out" : "find-correct";
  }, [data.options, data.targetShape]);

  useEffect(() => {
    if (!completed) return;
    audio.playEffect("stars-earned");
    const timer = setTimeout(() => {
      onComplete({
        activityId: `shape-identify-${data.targetShape}`,
        correct: true,
        attempts: mistakes + 1,
        timeMs: Date.now() - startTime,
        score: Math.max(0, 100 - mistakes * 12),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [completed, mistakes, startTime, data.targetShape, onComplete, audio]);

  const instruction =
    mode === "odd-one-out"
      ? "Tap the shape that does not belong."
      : `Which is a ${labelFor3DShape(toShape3DKind(data.targetShape))}?`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center text-lg font-medium text-blue-800">
        {instruction}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.options.map((option, index) => {
          const correct = index === data.correctIndex;
          return (
            <motion.button
              key={`${option}-${index}`}
              animate={wrongIndex === index ? { x: [0, -4, 4, -4, 0] } : {}}
              onClick={() => {
                if (completed) return;
                if (correct) {
                  setSelectedIndex(index);
                  setCompleted(true);
                  audio.playEffect("correct");
                } else {
                  setWrongIndex(index);
                  setMistakes((count) => count + 1);
                  audio.playEffect("try-again");
                  setTimeout(() => setWrongIndex(null), 350);
                }
              }}
              className={`rounded-3xl border-2 bg-white p-5 text-center shadow-sm transition active:scale-95 ${
                selectedIndex === index
                  ? "border-green-500 ring-2 ring-green-200"
                  : wrongIndex === index
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200"
              }`}
            >
              <Shape3DSVG shape={toShape3DKind(option)} className="mx-auto h-28 w-28" />
              <p className="mt-4 text-lg font-bold text-gray-800">
                {labelFor3DShape(toShape3DKind(option))}
              </p>
            </motion.button>
          );
        })}
      </div>

      {completed && (
        <div className="rounded-2xl bg-green-100 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-green-700">Correct shape!</p>
        </div>
      )}
    </div>
  );
}

function toShape3DKind(shape: string): Shape3DKind {
  return shape === "sphere" ? "ball" : (shape as Shape3DKind);
}

function labelFor3DShape(shape: Shape3DKind): string {
  if (shape === "ball") return "Ball shape";
  if (shape === "cube") return "Cube shape";
  if (shape === "cuboid") return "Cuboid shape";
  if (shape === "cylinder") return "Cylinder shape";
  return "Prism shape";
}
