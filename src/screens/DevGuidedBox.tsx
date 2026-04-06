import { useState } from "react";
import { GuidedBoxFill } from "../components/interactives/GuidedBoxFill";
import {
  SAMPLE_ADD_5_8,
  SAMPLE_SUB_14_6,
} from "../data/samples/make10-samples";
import type { ActivityResult, GuidedBoxProblem } from "../types/curriculum";

const PROBLEMS: { label: string; data: GuidedBoxProblem }[] = [
  { label: "Addition: 5 + 8", data: SAMPLE_ADD_5_8 },
  { label: "Subtraction: 14 - 6", data: SAMPLE_SUB_14_6 },
];

export function DevGuidedBox() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  const handleComplete = (result: ActivityResult) => {
    setLastResult(result);
  };

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: GuidedBoxFill
        </h1>

        {/* Problem picker */}
        <div className="mb-4 flex gap-2">
          {PROBLEMS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => {
                setSelectedIdx(i);
                setKey((k) => k + 1);
                setLastResult(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                i === selectedIdx
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => {
              setKey((k) => k + 1);
              setLastResult(null);
            }}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Component under test */}
        <GuidedBoxFill
          key={key}
          data={PROBLEMS[selectedIdx]!.data}
          onComplete={handleComplete}
        />

        {/* Result display */}
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
