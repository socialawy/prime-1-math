import { AreaGrid } from "./interactives/AreaGrid";
import { BlockGrouper } from "./interactives/BlockGrouper";
import { CapacityPourer } from "./interactives/CapacityPourer";
import { GuidedBoxFill } from "./interactives/GuidedBoxFill";
import { HundredsChart } from "./interactives/HundredsChart";
import { NumberLine } from "./interactives/NumberLine";
import { SplitTreeAdder } from "./interactives/SplitTreeAdder";
import type {
  Activity,
  ActivityResult,
  GuidedBoxProblem,
  Make10Data,
  SplitTreeProblem,
  Use10SubtractData,
} from "../types/curriculum";

interface ActivityRendererProps {
  activity: Activity;
  onComplete?: (result: ActivityResult) => void;
}

export function ActivityRenderer({
  activity,
  onComplete = () => {},
}: ActivityRendererProps) {
  switch (activity.conceptKey) {
    case "addition-make-10":
    case "subtraction-use-10": {
      const splitTreeProblem = toSplitTreeProblem(activity);
      if (!splitTreeProblem) {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Unsupported activity data." />;
      }
      return (
        <SplitTreeAdder
          data={splitTreeProblem}
          onComplete={onComplete}
        />
      );
    }

    case "guided-box-make10":
    case "guided-box-sub10": {
      if (!isGuidedBoxProblem(activity.data)) {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected guided-box data." />;
      }
      return <GuidedBoxFill data={activity.data} onComplete={onComplete} />;
    }

    case "place-value-hundreds-chart":
      if (activity.data.type !== "place-value-hundreds-chart") {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected hundreds-chart data." />;
      }
      return <HundredsChart data={activity.data} onComplete={onComplete} />;

    case "compare-area":
      if (activity.data.type !== "compare-area") {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected area-grid data." />;
      }
      return <AreaGrid data={activity.data} onComplete={onComplete} />;

    case "compare-capacity":
      if (activity.data.type !== "compare-capacity") {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected capacity data." />;
      }
      return <CapacityPourer data={activity.data} onComplete={onComplete} />;

    case "place-value-group":
      if (activity.data.type !== "place-value-group") {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected place-value group data." />;
      }
      return <BlockGrouper data={activity.data} onComplete={onComplete} />;

    case "place-value-number-line":
      if (activity.data.type !== "place-value-number-line") {
        return <PlaceholderCard conceptKey={activity.conceptKey} detail="Expected number-line data." />;
      }
      return <NumberLine data={activity.data} onComplete={onComplete} />;

    default:
      return <PlaceholderCard conceptKey={activity.conceptKey} />;
  }
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
