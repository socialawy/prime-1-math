import { lazy, Suspense, type ReactNode } from "react";
import { AssetIcon, ContextHintBadge } from "./shared/EmojiMap";
import type {
  Activity,
  ActivityResult,
  GuidedBoxProblem,
  Make10Data,
  SplitTreeProblem,
  Use10SubtractData,
} from "../types/curriculum";

const ArtCorner = lazy(() =>
  import("./interactives/ArtCorner").then((module) => ({ default: module.ArtCorner })),
);
const AreaGrid = lazy(() =>
  import("./interactives/AreaGrid").then((module) => ({ default: module.AreaGrid })),
);
const BlockGrouper = lazy(() =>
  import("./interactives/BlockGrouper").then((module) => ({ default: module.BlockGrouper })),
);
const CapacityPourer = lazy(() =>
  import("./interactives/CapacityPourer").then((module) => ({ default: module.CapacityPourer })),
);
const ClockFace = lazy(() =>
  import("./interactives/ClockFace").then((module) => ({ default: module.ClockFace })),
);
const GuidedBoxFill = lazy(() =>
  import("./interactives/GuidedBoxFill").then((module) => ({ default: module.GuidedBoxFill })),
);
const HundredsChart = lazy(() =>
  import("./interactives/HundredsChart").then((module) => ({ default: module.HundredsChart })),
);
const NumberLine = lazy(() =>
  import("./interactives/NumberLine").then((module) => ({ default: module.NumberLine })),
);
const ShapeComposer = lazy(() =>
  import("./interactives/ShapeComposer").then((module) => ({ default: module.ShapeComposer })),
);
const ShapeFootprint = lazy(() =>
  import("./interactives/ShapeFootprint").then((module) => ({ default: module.ShapeFootprint })),
);
const ShapeIdentifier = lazy(() =>
  import("./interactives/ShapeIdentifier").then((module) => ({ default: module.ShapeIdentifier })),
);
const SplitTreeAdder = lazy(() =>
  import("./interactives/SplitTreeAdder").then((module) => ({ default: module.SplitTreeAdder })),
);
const WordProblem = lazy(() =>
  import("./interactives/WordProblem").then((module) => ({ default: module.WordProblem })),
);

interface ActivityRendererProps {
  activity: Activity;
  onComplete?: (result: ActivityResult) => void;
}

export function ActivityRenderer({
  activity,
  onComplete = () => {},
}: ActivityRendererProps) {
  let content: ReactNode;

  switch (activity.conceptKey) {
    case "addition-make-10":
    case "subtraction-use-10": {
      const splitTreeProblem = toSplitTreeProblem(activity);
      if (!splitTreeProblem) {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Unsupported activity data." />;
        break;
      }
      content = <SplitTreeAdder data={splitTreeProblem} onComplete={onComplete} />;
      break;
    }

    case "guided-box-make10":
    case "guided-box-sub10":
      if (!isGuidedBoxProblem(activity.data)) {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected guided-box data." />;
        break;
      }
      content = <GuidedBoxFill data={activity.data} onComplete={onComplete} />;
      break;

    case "place-value-hundreds-chart":
      if (activity.data.type !== "place-value-hundreds-chart") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected hundreds-chart data." />;
        break;
      }
      content = <HundredsChart data={activity.data} onComplete={onComplete} />;
      break;

    case "art-corner":
      if (activity.data.type !== "art-corner") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected art-corner data." />;
        break;
      }
      content = <ArtCorner data={activity.data} onComplete={onComplete} />;
      break;

    case "compare-area":
      if (activity.data.type !== "compare-area") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected area-grid data." />;
        break;
      }
      content = <AreaGrid data={activity.data} onComplete={onComplete} />;
      break;

    case "compare-capacity":
      if (activity.data.type !== "compare-capacity") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected capacity data." />;
        break;
      }
      content = <CapacityPourer data={activity.data} onComplete={onComplete} />;
      break;

    case "shape-3d-identify":
      if (activity.data.type !== "shape-3d-identify") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected shape-identify data." />;
        break;
      }
      content = <ShapeIdentifier data={activity.data} onComplete={onComplete} />;
      break;

    case "shape-3d-to-2d":
      if (activity.data.type !== "shape-3d-to-2d") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected shape-footprint data." />;
        break;
      }
      content = <ShapeFootprint data={activity.data} onComplete={onComplete} />;
      break;

    case "compose-shapes":
      if (activity.data.type !== "compose-shapes") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected shape-composer data." />;
        break;
      }
      content = <ShapeComposer data={activity.data} onComplete={onComplete} />;
      break;

    case "tell-time":
      if (activity.data.type !== "tell-time") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected tell-time data." />;
        break;
      }
      content = <ClockFace data={activity.data} onComplete={onComplete} />;
      break;

    case "add-sub-mixed":
      if (activity.data.type !== "add-sub-mixed") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected word-problem data." />;
        break;
      }
      content = <WordProblem data={activity.data} onComplete={onComplete} />;
      break;

    case "place-value-group":
      if (activity.data.type !== "place-value-group") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected place-value group data." />;
        break;
      }
      content = <BlockGrouper data={activity.data} onComplete={onComplete} />;
      break;

    case "place-value-number-line":
      if (activity.data.type !== "place-value-number-line") {
        content = <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected number-line data." />;
        break;
      }
      content = <NumberLine data={activity.data} onComplete={onComplete} />;
      break;

    default:
      content = <PlaceholderCard conceptKey={activity.conceptKey} />;
      break;
  }

  return (
    <Suspense fallback={<LoadingCard />}>
      <div className="rounded-3xl bg-white p-4 md:p-5">
        {activity.contextHint && (
          <>
            <div className="mb-4 flex items-center justify-center">
              <AssetIcon hint={activity.contextHint} size="lg" />
            </div>
            <ContextHintBadge hint={activity.contextHint} />
          </>
        )}
        {content}
      </div>
    </Suspense>
  );
}

function toSplitTreeProblem(activity: Activity): SplitTreeProblem | null {
  if (isMake10Data(activity.data)) {
    return {
      mode: "addition",
      numberA: activity.data.addendA,
      numberB: activity.data.addendB,
      allowSplitChoice: false,
      presetSplit: activity.data.splitFrom,
      expectedAnswer: activity.data.targetSum,
    };
  }

  if (isUse10SubtractData(activity.data)) {
    return {
      mode: "subtraction",
      numberA: activity.data.minuend,
      numberB: activity.data.subtrahend,
      allowSplitChoice: false,
      presetSplit: "B",
      expectedAnswer: activity.data.finalResult,
    };
  }

  if (isGuidedBoxProblem(activity.data)) {
    const parsed = parseEquation(activity.data.equation);
    if (!parsed) return null;

    if (activity.conceptKey === "addition-make-10") {
      return {
        mode: "addition",
        numberA: parsed.left,
        numberB: parsed.right,
        allowSplitChoice: false,
        presetSplit: parsed.left >= parsed.right ? "B" : "A",
        expectedAnswer: activity.data.finalAnswer,
      };
    }

    if (activity.conceptKey === "subtraction-use-10") {
      return {
        mode: "subtraction",
        numberA: parsed.left,
        numberB: parsed.right,
        allowSplitChoice: false,
        presetSplit: "B",
        expectedAnswer: activity.data.finalAnswer,
      };
    }
  }

  return null;
}

function isGuidedBoxProblem(data: Activity["data"]): data is GuidedBoxProblem {
  return typeof data === "object" && data !== null && "equation" in data && "steps" in data;
}

function isMake10Data(data: Activity["data"]): data is Make10Data {
  return typeof data === "object" && data !== null && data.type === "addition-make-10";
}

function isUse10SubtractData(data: Activity["data"]): data is Use10SubtractData {
  return typeof data === "object" && data !== null && data.type === "subtraction-use-10";
}

function parseEquation(equation: string): { left: number; right: number } | null {
  const parts = equation.split(/[+-]/).map((part) => parseInt(part.trim(), 10));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }
  return { left: parts[0]!, right: parts[1]! };
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
      <p className="mt-3 text-sm font-medium">Loading activity...</p>
    </div>
  );
}

function PlaceholderCard({
  conceptKey,
  detail,
}: {
  conceptKey: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600 shadow-sm">
      <p className="text-lg font-bold text-gray-800">Coming soon</p>
      <p className="mt-2 font-mono text-sm">{conceptKey}</p>
      {detail && <p className="mt-2 text-sm text-gray-500">{detail}</p>}
    </div>
  );
}
