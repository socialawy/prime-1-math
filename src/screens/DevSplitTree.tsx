import { useState } from "react";
import { SplitTreeAdder } from "../components/interactives/SplitTreeAdder";
import { SPLIT_SAMPLES } from "../data/samples/splitTree-samples";
import type { ActivityResult } from "../types/curriculum";

export function DevSplitTree() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  const problem = SPLIT_SAMPLES[selectedIdx]!;
  const label =
    problem.mode === "addition"
      ? `${problem.numberA} + ${problem.numberB}`
      : `${problem.numberA} − ${problem.numberB}`;

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: SplitTreeAdder
        </h1>

        {/* Problem picker */}
        <div className="mb-4 flex flex-wrap gap-2">
          {SPLIT_SAMPLES.map((s, i) => {
            const l =
              s.mode === "addition"
                ? `${s.numberA}+${s.numberB}`
                : `${s.numberA}−${s.numberB}`;
            return (
              <button
                key={l}
                onClick={() => {
                  setSelectedIdx(i);
                  setKey((k) => k + 1);
                  setLastResult(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  i === selectedIdx
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                {s.mode === "addition" ? "➕" : "➖"} {l}
              </button>
            );
          })}
          <button
            onClick={() => {
              setKey((k) => k + 1);
              setLastResult(null);
            }}
            className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-600"
          >
            Reset
          </button>
        </div>

        <p className="mb-2 text-center text-sm text-gray-400">
          {problem.mode} | {label} |{" "}
          {problem.allowSplitChoice ? "choice" : `preset=${problem.presetSplit}`}
        </p>

        <SplitTreeAdder
          key={key}
          data={problem}
          onComplete={(r) => setLastResult(r)}
        />

        {lastResult && (
          <div className="mt-6 rounded-xl bg-white p-4 shadow">
            <h2 className="mb-2 font-bold text-gray-700">Result</h2>
            <pre className="text-sm text-gray-600">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
