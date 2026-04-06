import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

interface DraggableDotsProps {
  count: number;
  color: string;
  groups?: [number, number];
  highlightGroup?: 0 | 1;
  dotSize?: number;
}

const DEFAULT_DOT_SIZE = 48;

export function DraggableDots({
  count,
  color,
  groups,
  highlightGroup,
  dotSize = DEFAULT_DOT_SIZE,
}: DraggableDotsProps) {
  if (groups) {
    const [g0, g1] = groups;
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Group 0 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: g0 }, (_, i) => (
            <Dot
              key={`g0-${i}`}
              id={`dot-g0-${i}`}
              color={color}
              size={dotSize}
              draggable={highlightGroup === 0}
              highlighted={highlightGroup === 0}
            />
          ))}
        </div>
        {/* Visual separator */}
        {g0 > 0 && g1 > 0 && (
          <div className="h-8 w-px bg-gray-300" />
        )}
        {/* Group 1 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: g1 }, (_, i) => (
            <Dot
              key={`g1-${i}`}
              id={`dot-g1-${i}`}
              color={color}
              size={dotSize}
              draggable={highlightGroup === 1}
              highlighted={highlightGroup === 1}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <Dot
          key={`dot-${i}`}
          id={`dot-${i}`}
          color={color}
          size={dotSize}
          draggable={false}
          highlighted={false}
        />
      ))}
    </div>
  );
}

function Dot({
  id,
  color,
  size,
  draggable,
  highlighted,
}: {
  id: string;
  color: string;
  size: number;
  draggable: boolean;
  highlighted: boolean;
}) {
  if (draggable) {
    return <DraggableDot id={id} color={color} size={size} />;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`rounded-full ${highlighted ? "ring-2 ring-yellow-400 ring-offset-1" : ""}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: highlighted ? 1 : 0.6,
      }}
    />
  );
}

function DraggableDot({
  id,
  color,
  size,
}: {
  id: string;
  color: string;
  size: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ scale: 0 }}
      animate={{ scale: isDragging ? 1.2 : 1 }}
      className="rounded-full ring-2 ring-yellow-400 ring-offset-1"
      style={style}
      {...listeners}
      {...attributes}
    />
  );
}
