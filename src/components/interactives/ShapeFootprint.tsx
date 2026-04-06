import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, Shape3Dto2DData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";
import { Shape2DSVG, type Shape2DKind } from "../shared/Shape2DSVG";
import { Shape3DSVG, type Shape3DKind } from "../shared/Shape3DSVG";

interface ShapeFootprintProps {
  data: Shape3Dto2DData;
  onComplete: (result: ActivityResult) => void;
}

export function ShapeFootprint({ data, onComplete }: ShapeFootprintProps) {
  const { audio } = useApp();
  const [selected, setSelected] = useState<Shape2DKind | null>(null);
  const [wrong, setWrong] = useState<Shape2DKind | null>(null);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());

  const options = useMemo(
    () => [data.correctFootprint, ...data.distractors].slice(0, 4) as Shape2DKind[],
    [data.correctFootprint, data.distractors],
  );

  useEffect(() => {
    if (!completed) return;
    audio.playEffect("stars-earned");
    const timer = setTimeout(() => {
      onComplete({
        activityId: `shape-footprint-${data.shape3d}`,
        correct: true,
        attempts: mistakes + 1,
        timeMs: Date.now() - startTime,
        score: Math.max(0, 100 - mistakes * 12),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [completed, mistakes, startTime, data.shape3d, onComplete, audio]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center text-lg font-medium text-blue-800">
        What 2D shape do you get from this {labelFor3DShape(toShape3DKind(data.shape3d)).toLowerCase()}?
      </div>

      <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="relative flex justify-center">
          <Shape3DSVG shape={toShape3DKind(data.shape3d)} className="h-40 w-40" />
          {completed && selected === data.correctFootprint && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.95 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Shape2DSVG shape={data.correctFootprint} className="h-24 w-24 drop-shadow-lg" />
            </motion.div>
          )}
        </div>

        <div className="text-center text-3xl font-bold text-gray-300">→</div>

        <div className="grid grid-cols-2 gap-4">
          {options.map((shape) => (
            <motion.button
              key={shape}
              animate={wrong === shape ? { x: [0, -4, 4, -4, 0] } : {}}
              onClick={() => {
                if (completed) return;
                if (shape === data.correctFootprint) {
                  setSelected(shape);
                  setCompleted(true);
                  audio.playEffect("correct");
                } else {
                  setWrong(shape);
                  setMistakes((count) => count + 1);
                  audio.playEffect("try-again");
                  setTimeout(() => setWrong(null), 350);
                }
              }}
              className={`rounded-2xl border-2 bg-white p-4 shadow-sm transition active:scale-95 ${
                selected === shape
                  ? "border-green-500 ring-2 ring-green-200"
                  : wrong === shape
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200"
              }`}
            >
              <Shape2DSVG shape={shape} className="mx-auto h-20 w-20" />
              <p className="mt-2 text-base font-bold text-gray-800">{labelFor2DShape(shape)}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {completed && (
        <div className="rounded-2xl bg-green-100 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-green-700">Nice tracing!</p>
        </div>
      )}
    </div>
  );
}

function toShape3DKind(shape: Shape3Dto2DData["shape3d"]): Shape3DKind {
  return shape === "sphere" ? "ball" : shape;
}

function labelFor3DShape(shape: Shape3DKind): string {
  if (shape === "ball") return "Ball shape";
  if (shape === "cube") return "Cube shape";
  if (shape === "cuboid") return "Cuboid shape";
  if (shape === "cylinder") return "Cylinder shape";
  return "Prism shape";
}

function labelFor2DShape(shape: Shape2DKind): string {
  return shape.charAt(0).toUpperCase() + shape.slice(1);
}
