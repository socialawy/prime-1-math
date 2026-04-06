import { useState } from "react";
import { NumberLine } from "../components/interactives/NumberLine";
import {
  SAMPLE_NUMBER_LINE_BY_2,
  SAMPLE_NUMBER_LINE_BY_5,
  SAMPLE_NUMBER_LINE_BY_10,
  RANDOM_NUMBER_LINES,
} from "../data/samples/numberLine-samples";
import type { ActivityResult, NumberLineData } from "../types/curriculum";

const PROBLEMS: { label: string; data: NumberLineData }[] = [
  { label: "Jump by 2", data: SAMPLE_NUMBER_LINE_BY_2 },
  { label: "Jump by 5", data: SAMPLE_NUMBER_LINE_BY_5 },
  { label: "Jump by 10", data: SAMPLE_NUMBER_LINE_BY_10 },
  { label: "Random 1", data: RANDOM_NUMBER_LINES[0]! },
  { label: "Random 2", data: RANDOM_NUMBER_LINES[1]! },
  { label: "Random 3", data: RANDOM_NUMBER_LINES[2]! },
];

export function DevNumberLine() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: NumberLine
        </h1>

        <div className="mb-4 flex flex-wrap gap-2">
          {PROBLEMS.map((problem, index) => (
            <button
              key={problem.label}
              onClick={() => {
                setSelectedIdx(index);
                setKey((value) => value + 1);
                setLastResult(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                index === selectedIdx
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {problem.label}
            </button>
          ))}
          <button
            onClick={() => {
              setKey((value) => value + 1);
              setLastResult(null);
            }}
            className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-600"
          >
            Reset
          </button>
        </div>

        <NumberLine
          key={key}
          data={PROBLEMS[selectedIdx]!.data}
          onComplete={(result) => setLastResult(result)}
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
