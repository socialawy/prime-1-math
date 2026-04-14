import { useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, NumberComparisonData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";

interface NumberComparisonProps {
  data: NumberComparisonData;
  onComplete: (result: ActivityResult) => void;
}

const SYMBOLS = [">", "<", "="] as const;

export function NumberComparison({ data, onComplete }: NumberComparisonProps) {
  const { audio } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());

  const pair = data.pairs[currentIndex]!;
  const isLast = currentIndex === data.pairs.length - 1;

  function handlePick(symbol: string) {
    if (showCorrect) return;
    setSelected(symbol);

    if (symbol === pair.correctSymbol) {
      audio.playEffect("correct");
      setShowCorrect(true);

      setTimeout(() => {
        if (isLast) {
          audio.playEffect("stars-earned");
          onComplete({
            activityId: `comparison-${data.pairs.map((p) => `${p.left.value}-${p.right.value}`).join("_")}`,
            correct: mistakes === 0,
            attempts: mistakes + 1,
            timeMs: Date.now() - startTime,
            score: Math.max(0, 100 - mistakes * 20),
          });
        } else {
          setCurrentIndex((i) => i + 1);
          setSelected(null);
          setShowCorrect(false);
        }
      }, 900);
    } else {
      audio.playEffect("try-again");
      setMistakes((m) => m + 1);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSelected(null);
      }, 500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Progress dots */}
      {data.pairs.length > 1 && (
        <div className="flex gap-2">
          {data.pairs.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i < currentIndex
                  ? "bg-emerald-400"
                  : i === currentIndex
                    ? "bg-blue-500"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      <p className="text-lg font-semibold text-gray-700">
        Compare using &gt;, &lt;, or =
      </p>

      {/* Comparison card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, x: shake ? [0, -8, 8, -8, 0] : 0 }}
        className="flex items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-md"
      >
        {/* Left value */}
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600">{pair.left.label}</span>
        </div>

        {/* Symbol picker */}
        <div className="flex gap-2">
          {SYMBOLS.map((sym) => {
            const isCorrectReveal = showCorrect && sym === pair.correctSymbol;
            const isWrongPick = shake && sym === selected;
            return (
              <button
                key={sym}
                onClick={() => handlePick(sym)}
                disabled={showCorrect}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                  isCorrectReveal
                    ? "border-emerald-400 bg-emerald-100 text-emerald-600"
                    : isWrongPick
                      ? "border-red-400 bg-red-50 text-red-500"
                      : selected === sym
                        ? "border-blue-400 bg-blue-50 text-blue-600"
                        : "border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>

        {/* Right value */}
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-600">{pair.right.label}</span>
        </div>
      </motion.div>

      {showCorrect && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-lg font-bold text-emerald-500"
        >
          {pair.left.label} {pair.correctSymbol} {pair.right.label} {isLast ? "— Well done!" : "— Correct!"}
        </motion.p>
      )}
    </div>
  );
}
