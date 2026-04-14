import type { TellTimeData } from "../../types/curriculum";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function generateClockProblem(
  mode: "read-time" | "set-time",
): TellTimeData {
  const hour = randomInt(1, 12);
  const minuteType = pickRandom<"o-clock" | "half-past">([
    "o-clock",
    "half-past",
  ]);
  const hourHandAngle = getHourAngle(hour, minuteType);
  const minuteHandAngle = minuteType === "o-clock" ? 0 : 180;
  const correctLabel = formatTimeLabel(hour, minuteType);

  if (mode === "read-time") {
    const options = shuffle([
      correctLabel,
      ...generateWrongTimes(hour, minuteType, 2),
    ]);

    return {
      type: "tell-time",
      mode,
      hourHandAngle,
      minuteHandAngle,
      correctHour: hour,
      correctMinuteLabel: minuteType,
      options,
      correctOption: correctLabel,
    };
  }

  return {
    type: "tell-time",
    mode,
    hourHandAngle: 0,
    minuteHandAngle: 0,
    correctHour: hour,
    correctMinuteLabel: minuteType,
  };
}

function generateWrongTimes(
  hour: number,
  minuteType: "o-clock" | "half-past",
  count: number,
): string[] {
  const wrongs = new Set<string>();
  while (wrongs.size < count) {
    const candidateHour = pickRandom([
      hour === 12 ? 1 : hour + 1,
      hour === 1 ? 12 : hour - 1,
      randomInt(1, 12),
    ]);
    const candidateMinute =
      Math.random() > 0.5
        ? minuteType === "o-clock"
          ? "half-past"
          : "o-clock"
        : minuteType;
    const label = formatTimeLabel(candidateHour, candidateMinute);
    if (label !== formatTimeLabel(hour, minuteType)) wrongs.add(label);
  }
  return [...wrongs];
}

export function formatTimeLabel(
  hour: number,
  minuteType: "o-clock" | "half-past",
): string {
  return minuteType === "o-clock" ? `${hour} o'clock` : `half past ${hour}`;
}

export function getHourAngle(
  hour: number,
  minuteType: "o-clock" | "half-past",
): number {
  const normalizedHour = hour % 12;
  return normalizedHour * 30 + (minuteType === "half-past" ? 15 : 0);
}
