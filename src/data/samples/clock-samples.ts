import type { TellTimeData } from "../../types/curriculum";
import { generateClockProblem } from "../../lib/generators/clockGenerator";

export const SAMPLE_CLOCK_READ: TellTimeData = {
  type: "tell-time",
  mode: "read-time",
  hourHandAngle: 90,
  minuteHandAngle: 0,
  correctHour: 3,
  correctMinuteLabel: "o-clock",
  options: ["3 o'clock", "3 half past", "6 o'clock"],
  correctOption: "3 o'clock",
};

export const SAMPLE_CLOCK_SET: TellTimeData = {
  type: "tell-time",
  mode: "set-time",
  hourHandAngle: 0,
  minuteHandAngle: 0,
  correctHour: 7,
  correctMinuteLabel: "half-past",
};

export const RANDOM_CLOCK_READ = generateClockProblem("read-time");
export const RANDOM_CLOCK_SET = generateClockProblem("set-time");
