import { useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";

interface TenFrameProps {
  filledCount: number;
  filledColor: string;
  emptySlots: boolean;
  droppable: boolean;
  onSlotDrop?: (slotIndex: number) => void;
  size: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { cell: 36, gap: 3, dot: 24 },
  md: { cell: 48, gap: 4, dot: 32 },
  lg: { cell: 56, gap: 5, dot: 40 },
} as const;

// Standard ten-frame: 2 rows × 5 cols, fills left→right, top→bottom
// Slots 0-4 = top row, 5-9 = bottom row
export function TenFrame({
  filledCount,
  filledColor,
  emptySlots,
  droppable,
  size,
}: TenFrameProps) {
  const s = SIZES[size];

  return (
    <div
      className="inline-grid grid-cols-5 rounded-xl border-2 border-gray-300 bg-white p-1"
      style={{ gap: s.gap }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <TenFrameCell
          key={i}
          index={i}
          filled={i < filledCount}
          filledColor={filledColor}
          showEmpty={emptySlots}
          droppable={droppable && i >= filledCount}
          cellSize={s.cell}
          dotSize={s.dot}
        />
      ))}
    </div>
  );
}

function TenFrameCell({
  index,
  filled,
  filledColor,
  showEmpty,
  droppable: isDroppable,
  cellSize,
  dotSize,
}: {
  index: number;
  filled: boolean;
  filledColor: string;
  showEmpty: boolean;
  droppable: boolean;
  cellSize: number;
  dotSize: number;
}) {
  if (isDroppable) {
    return (
      <DroppableSlot
        index={index}
        cellSize={cellSize}
        dotSize={dotSize}
        showEmpty={showEmpty}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-lg border border-gray-200"
      style={{ width: cellSize, height: cellSize }}
    >
      <AnimatePresence>
        {filled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: filledColor,
            }}
          />
        )}
      </AnimatePresence>
      {!filled && showEmpty && (
        <div
          className="rounded-full border-2 border-dashed border-gray-200"
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  );
}

function DroppableSlot({
  index,
  cellSize,
  dotSize,
  showEmpty,
}: {
  index: number;
  cellSize: number;
  dotSize: number;
  showEmpty: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `frame-slot-${index}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-center rounded-lg border-2 transition-colors ${
        isOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
      style={{ width: cellSize, height: cellSize }}
    >
      {showEmpty && (
        <div
          className={`rounded-full border-2 border-dashed transition-colors ${
            isOver ? "border-blue-400" : "border-gray-200"
          }`}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  );
}
