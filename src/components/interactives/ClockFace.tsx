import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityResult, TellTimeData } from "../../types/curriculum";
import { useApp } from "../../context/AppContext";
import { formatTimeLabel, getHourAngle } from "../../lib/generators/clockGenerator";

interface ClockFaceProps {
  data: TellTimeData;
  onComplete: (result: ActivityResult) => void;
}

export function ClockFace({ data, onComplete }: ClockFaceProps) {
  const { audio } = useApp();
  const [hourAngle, setHourAngle] = useState(data.mode === "set-time" ? 0 : data.hourHandAngle);
  const [minuteAngle, setMinuteAngle] = useState(
    data.mode === "set-time" ? 0 : data.minuteHandAngle,
  );
  const [wrongOption, setWrongOption] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [draggingHand, setDraggingHand] = useState<"hour" | "minute" | null>(null);
  const [startTime] = useState(() => Date.now());
  const svgRef = useRef<SVGSVGElement | null>(null);

  const mode = data.mode ?? "read-time";
  const targetHourAngle = getHourAngle(data.correctHour, data.correctMinuteLabel);
  const targetMinuteAngle = data.correctMinuteLabel === "o-clock" ? 0 : 180;

  useEffect(() => {
    if (!completed) return;
    audio.playEffect("stars-earned");
    const timer = setTimeout(() => {
      onComplete({
        activityId: `clock-${mode}-${data.correctHour}-${data.correctMinuteLabel}`,
        correct: true,
        attempts: mistakes + 1,
        timeMs: Date.now() - startTime,
        score: Math.max(0, 100 - mistakes * 10),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [completed, audio, onComplete, mode, data.correctHour, data.correctMinuteLabel, mistakes, startTime]);

  useEffect(() => {
    if (!draggingHand) return;

    const handleMove = (event: PointerEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rawAngle = Math.atan2(event.clientY - cy, event.clientX - cx) * (180 / Math.PI) + 90;
      const normalized = (rawAngle + 360) % 360;

      if (draggingHand === "minute") {
        setMinuteAngle(normalized < 90 || normalized > 270 ? 0 : 180);
      } else {
        setHourAngle((Math.round(normalized / 30) * 30) % 360);
      }
    };

    const handleUp = () => setDraggingHand(null);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingHand]);

  const options = useMemo(
    () => data.options ?? [formatTimeLabel(data.correctHour, data.correctMinuteLabel)],
    [data.options, data.correctHour, data.correctMinuteLabel],
  );

  const handleCheckSetTime = () => {
    const matches =
      hourAngle === targetHourAngle && minuteAngle === targetMinuteAngle;
    if (matches) {
      setCompleted(true);
      audio.playEffect("correct");
      return;
    }

    setMistakes((count) => count + 1);
    audio.playEffect("try-again");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
      <div className="rounded-2xl bg-blue-50 p-5 text-center text-lg font-medium text-blue-800">
        {mode === "read-time"
          ? "What time is it?"
          : `Show ${formatTimeLabel(data.correctHour, data.correctMinuteLabel)}.`}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mx-auto flex max-w-md justify-center">
          <svg ref={svgRef} viewBox="0 0 240 240" className="h-64 w-64">
            <circle cx="120" cy="120" r="104" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="6" />
            {Array.from({ length: 12 }, (_, index) => {
              const hour = index + 1;
              const angle = ((hour * 30) - 90) * (Math.PI / 180);
              const x = 120 + Math.cos(angle) * 82;
              const y = 120 + Math.sin(angle) * 82;
              return (
                <text
                  key={hour}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[14px] font-bold"
                >
                  {hour}
                </text>
              );
            })}

            <ClockHand
              angle={hourAngle}
              length={56}
              width={8}
              color="#1d4ed8"
              draggable={mode === "set-time"}
              onPointerDown={() => setDraggingHand("hour")}
            />
            <ClockHand
              angle={minuteAngle}
              length={82}
              width={5}
              color="#0f172a"
              draggable={mode === "set-time"}
              onPointerDown={() => setDraggingHand("minute")}
            />
            <circle cx="120" cy="120" r="8" fill="#0f172a" />
          </svg>
        </div>

        {mode === "read-time" ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {options.map((option) => (
              <motion.button
                key={option}
                animate={wrongOption === option ? { x: [0, -4, 4, -4, 0] } : {}}
                onClick={() => {
                  if (completed) return;
                  if (option === data.correctOption) {
                    setCompleted(true);
                    audio.playEffect("correct");
                  } else {
                    setWrongOption(option);
                    setMistakes((count) => count + 1);
                    audio.playEffect("try-again");
                    setTimeout(() => setWrongOption(null), 350);
                  }
                }}
                className={`rounded-2xl border-2 px-4 py-4 text-lg font-bold shadow-sm ${
                  completed && option === data.correctOption
                    ? "border-green-500 bg-green-50 text-green-700"
                    : wrongOption === option
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-slate-800"
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCheckSetTime}
              className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow active:scale-95"
            >
              Check time
            </button>
          </div>
        )}
      </div>

      {completed && (
        <div className="rounded-2xl bg-green-100 px-8 py-6 text-center">
          <p className="text-2xl font-bold text-green-700">Nice clock reading!</p>
        </div>
      )}
    </div>
  );
}

function ClockHand({
  angle,
  length,
  width,
  color,
  draggable,
  onPointerDown,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  draggable: boolean;
  onPointerDown: () => void;
}) {
  const radians = (angle - 90) * (Math.PI / 180);
  const x2 = 120 + Math.cos(radians) * length;
  const y2 = 120 + Math.sin(radians) * length;

  return (
    <line
      x1="120"
      y1="120"
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      onPointerDown={draggable ? onPointerDown : undefined}
      className={draggable ? "cursor-grab" : ""}
    />
  );
}
