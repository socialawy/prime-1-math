import { useState } from "react";
import { HundredsChart } from "../components/interactives/HundredsChart";
import {
  SAMPLE_FILL_MISSING,
  SAMPLE_JUMP_BY_10,
  SAMPLE_COLOR_PATTERN,
  SAMPLE_FIND_NUMBER,
} from "../data/samples/hundredsChart-samples";
import type { ActivityResult, HundredsChartData } from "../types/curriculum";

const MODES: { label: string; data: HundredsChartData }[] = [
  { label: "Fill Missing", data: SAMPLE_FILL_MISSING },
  { label: "Jump by 10", data: SAMPLE_JUMP_BY_10 },
  { label: "Color Pattern", data: SAMPLE_COLOR_PATTERN },
  { label: "Find Number", data: SAMPLE_FIND_NUMBER },
];

export function DevHundredsChart() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: HundredsChart
        </h1>

        {/* Mode tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {MODES.map((m, i) => (
            <button
              key={m.label}
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
              {m.label}
            </button>
          ))}
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

        <HundredsChart
          key={key}
          data={MODES[selectedIdx]!.data}
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
