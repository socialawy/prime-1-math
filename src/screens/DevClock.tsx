import { useState } from "react";
import { ClockFace } from "../components/interactives/ClockFace";
import {
  RANDOM_CLOCK_READ,
  RANDOM_CLOCK_SET,
  SAMPLE_CLOCK_READ,
  SAMPLE_CLOCK_SET,
} from "../data/samples/clock-samples";
import type { ActivityResult, TellTimeData } from "../types/curriculum";

const PROBLEMS: { label: string; data: TellTimeData }[] = [
  { label: "Read Time", data: SAMPLE_CLOCK_READ },
  { label: "Set Time", data: SAMPLE_CLOCK_SET },
  { label: "Random Read", data: RANDOM_CLOCK_READ },
  { label: "Random Set", data: RANDOM_CLOCK_SET },
];

export function DevClock() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: ClockFace
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

        <ClockFace
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
