import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, ArtCornerData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

interface ArtCornerProps {
  data: ArtCornerData;
  onComplete: (result: ActivityResult) => void;
}

type CellColor = "white" | "blue" | "orange";

export function ArtCorner({ data, onComplete }: ArtCornerProps) {
  const { audio } = useApp();
  const [cellColors, setCellColors] = useState<Record<string, CellColor>>(
    Object.fromEntries(data.regions.map((region) => [region.id, "white"])) as Record<
      string,
      CellColor
    >,
  );
  const [wrongCells, setWrongCells] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (!completed) return;
    audio.playEffect("stars-earned");
    const timer = setTimeout(() => {
      onComplete({
        activityId: `art-corner-${data.regions.length}`,
        correct: true,
        attempts: mistakes + 1,
        timeMs: Date.now() - startTime,
        score: Math.max(0, 100 - mistakes * 8),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [completed, audio, onComplete, data.regions.length, mistakes, startTime]);

  const columns = useMemo(() => {
    if (data.regions.length >= 16) return 4;
    if (data.regions.length >= 12) return 4;
    return 3;
  }, [data.regions.length]);

  const cycleColor = (current: CellColor): CellColor =>
    current === "white" ? "blue" : current === "blue" ? "orange" : "white";

  const checkColors = () => {
    const mismatches = data.regions
      .filter((region) => cellColors[region.id] !== region.correctColor)
      .map((region) => region.id);

    if (mismatches.length === 0) {
      setCompleted(true);
      audio.playEffect("correct");
      return;
    }

    setWrongCells(mismatches);
    setMistakes((count) => count + 1);
    audio.playEffect("try-again");
    setTimeout(() => setWrongCells([]), 900);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center text-lg font-medium text-blue-800">
        {data.instruction}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div
          className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {data.regions.map((region) => {
            const color = cellColors[region.id];
            return (
              <motion.button
                key={region.id}
                animate={wrongCells.includes(region.id) ? { x: [0, -4, 4, -4, 0] } : {}}
                onClick={() =>
                  setCellColors((prev) => ({
                    ...prev,
                    [region.id]: cycleColor(prev[region.id] ?? "white"),
                  }))
                }
                className={`rounded-2xl border-2 p-5 text-center shadow-sm transition active:scale-95 ${
                  color === "orange"
                    ? "border-orange-300 bg-orange-100 text-orange-900"
                    : color === "blue"
                      ? "border-blue-300 bg-blue-100 text-blue-900"
                      : "border-gray-200 bg-white text-slate-800"
                } ${wrongCells.includes(region.id) ? "ring-2 ring-red-300" : ""}`}
              >
                <p className="text-2xl font-bold">{region.equation}</p>
                <p className="mt-2 text-sm opacity-70">= {region.correctResult}</p>
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Color code</h2>
          <div className="space-y-3">
            {data.colorCode.map((entry) => (
              <div key={entry.color} className="flex items-center gap-3">
                <span
                  className={`inline-block h-5 w-5 rounded-full ${
                    entry.color === "orange" ? "bg-orange-400" : "bg-blue-400"
                  }`}
                />
                <span className="text-sm text-slate-700">
                  {entry.rule} → {entry.color}
                </span>
              </div>
            ))}
          </div>

          {!completed && (
            <button
              onClick={checkColors}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-lg font-bold text-white shadow active:scale-95"
            >
              Check colors
            </button>
          )}
        </div>
      </div>

      {completed && (
        <div className="rounded-2xl bg-green-100 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-green-700">Beautiful work!</p>
        </div>
      )}
    </div>
  );
}
