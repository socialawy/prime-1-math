import { useState } from "react";
import { ArtCorner } from "../components/interactives/ArtCorner";
import {
  RANDOM_ART_CORNER_9,
  RANDOM_ART_CORNER_12,
  SAMPLE_ART_CORNER,
} from "../data/samples/artCorner-samples";
import type { ActivityResult, ArtCornerData } from "../types/curriculum";

const PROBLEMS: { label: string; data: ArtCornerData }[] = [
  { label: "Sample 3x3", data: SAMPLE_ART_CORNER },
  { label: "Random 3x3", data: RANDOM_ART_CORNER_9 },
  { label: "Random 4x3", data: RANDOM_ART_CORNER_12 },
];

export function DevArtCorner() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: ArtCorner
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

        <ArtCorner
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
