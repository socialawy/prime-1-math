import { useState } from "react";
import { ShapeComposer } from "../components/interactives/ShapeComposer";
import { ShapeFootprint } from "../components/interactives/ShapeFootprint";
import { ShapeIdentifier } from "../components/interactives/ShapeIdentifier";
import {
  RANDOM_SHAPE_COMPOSER,
  SAMPLE_SHAPE_COMPOSER,
} from "../data/samples/shapeComposer-samples";
import {
  RANDOM_SHAPE_FOOTPRINT,
  RANDOM_SHAPE_IDENTIFIER_FIND,
  RANDOM_SHAPE_IDENTIFIER_ODD,
  SAMPLE_SHAPE_FOOTPRINT,
  SAMPLE_SHAPE_IDENTIFIER_FIND,
  SAMPLE_SHAPE_IDENTIFIER_ODD,
} from "../data/samples/shape-samples";
import type {
  ActivityResult,
  ComposeShapesData,
  Shape3Dto2DData,
  ShapeIdentifyData,
} from "../types/curriculum";

const IDENTIFIER_SAMPLES: { label: string; data: ShapeIdentifyData }[] = [
  { label: "Find Correct", data: SAMPLE_SHAPE_IDENTIFIER_FIND },
  { label: "Odd One Out", data: SAMPLE_SHAPE_IDENTIFIER_ODD },
  { label: "Random Find", data: RANDOM_SHAPE_IDENTIFIER_FIND },
  { label: "Random Odd", data: RANDOM_SHAPE_IDENTIFIER_ODD },
];

const FOOTPRINT_SAMPLES: { label: string; data: Shape3Dto2DData }[] = [
  { label: "Sample", data: SAMPLE_SHAPE_FOOTPRINT },
  { label: "Random", data: RANDOM_SHAPE_FOOTPRINT },
];

const COMPOSER_SAMPLES: { label: string; data: ComposeShapesData }[] = [
  { label: "Sample", data: SAMPLE_SHAPE_COMPOSER },
  { label: "Random", data: RANDOM_SHAPE_COMPOSER },
];

export function DevShapes() {
  const [tab, setTab] = useState<"identifier" | "footprint" | "composer">("identifier");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [lastResult, setLastResult] = useState<ActivityResult | null>(null);

  const isIdentifier = tab === "identifier";
  const isFootprint = tab === "footprint";
  const samples = isIdentifier
    ? IDENTIFIER_SAMPLES
    : isFootprint
      ? FOOTPRINT_SAMPLES
      : COMPOSER_SAMPLES;

  return (
    <div className="min-h-screen bg-sky-50 p-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Dev: Shapes
        </h1>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTab("identifier");
              setSelectedIdx(0);
              setKey((value) => value + 1);
              setLastResult(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              isIdentifier ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            }`}
          >
            Shape Identifier
          </button>
          <button
            onClick={() => {
              setTab("footprint");
              setSelectedIdx(0);
              setKey((value) => value + 1);
              setLastResult(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              !isIdentifier ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            }`}
          >
            Shape Footprint
          </button>
          <button
            onClick={() => {
              setTab("composer");
              setSelectedIdx(0);
              setKey((value) => value + 1);
              setLastResult(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              tab === "composer" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            }`}
          >
            Shape Composer
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {samples.map((sample, index) => (
            <button
              key={`${tab}-${sample.label}`}
              onClick={() => {
                setSelectedIdx(index);
                setKey((value) => value + 1);
                setLastResult(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                index === selectedIdx ? "bg-emerald-600 text-white" : "bg-white text-gray-600"
              }`}
            >
              {sample.label}
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

        {isIdentifier ? (
          <ShapeIdentifier
            key={key}
            data={IDENTIFIER_SAMPLES[selectedIdx]!.data}
            onComplete={(result) => setLastResult(result)}
          />
        ) : isFootprint ? (
          <ShapeFootprint
            key={key}
            data={FOOTPRINT_SAMPLES[selectedIdx]!.data}
            onComplete={(result) => setLastResult(result)}
          />
        ) : (
          <ShapeComposer
            key={key}
            data={COMPOSER_SAMPLES[selectedIdx]!.data}
            onComplete={(result) => setLastResult(result)}
          />
        )}

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
