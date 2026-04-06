import {
  createContext,
  useContext,
  useReducer,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  ProgressStore,
  AppSettings,
  ActivityResult,
  SoundEffect,
  StudentProfile,
  ChapterProgress,
} from "../types/curriculum";
import { storage } from "../lib/storage";

// --- Progress Actions ---

type ProgressAction =
  | {
      type: "COMPLETE_ACTIVITY";
      chapterId: string;
      lessonId: string;
      activityId: string;
      result: ActivityResult;
    }
  | {
      type: "COMPLETE_LESSON";
      chapterId: string;
      lessonId: string;
      score: number;
    }
  | { type: "UNLOCK_CHAPTER"; chapterId: string }
  | { type: "ADD_STARS"; count: number }
  | { type: "RESET_PROGRESS" };

const CHAPTER_SEQUENCE = [
  "ch10",
  "ch11",
  "ch12",
  "ch13",
  "ch14",
  "ch15",
  "ch16",
  "ch17",
] as const;

function createEmptyChapterProgress(
  chapterId: string,
  status: "locked" | "available" | "in-progress" | "completed",
): ChapterProgress {
  return {
    chapterId,
    status,
    lessonsProgress: {},
    bestScore: 0,
    starsEarned: 0 as const,
  };
}

function getNextChapterId(chapterId: string): string | null {
  const currentIndex = CHAPTER_SEQUENCE.indexOf(chapterId as (typeof CHAPTER_SEQUENCE)[number]);
  if (currentIndex === -1 || currentIndex === CHAPTER_SEQUENCE.length - 1) return null;
  return CHAPTER_SEQUENCE[currentIndex + 1] ?? null;
}

function createDefaultProgress(student: StudentProfile): ProgressStore {
  return {
    student,
    chapterProgress: {
      ch10: createEmptyChapterProgress("ch10", "available"),
    },
    totalStars: 0,
    streakDays: 0,
    lastSessionDate: new Date().toISOString().slice(0, 10),
  };
}

function progressReducer(
  state: ProgressStore,
  action: ProgressAction,
): ProgressStore {
  let next: ProgressStore;

  switch (action.type) {
    case "COMPLETE_ACTIVITY": {
      const cp = state.chapterProgress[action.chapterId] ??
        createEmptyChapterProgress(
          action.chapterId,
          action.chapterId === "ch10" ? "available" : "in-progress",
        );
      const lp = cp.lessonsProgress[action.lessonId] ?? {
        lessonId: action.lessonId,
        status: "in-progress" as const,
        activitiesCompleted: [],
        attempts: [],
        bestScore: 0,
      };

      const completed = lp.activitiesCompleted.includes(action.activityId)
        ? lp.activitiesCompleted
        : [...lp.activitiesCompleted, action.activityId];

      next = {
        ...state,
        chapterProgress: {
          ...state.chapterProgress,
          [action.chapterId]: {
            ...cp,
            status: "in-progress",
            lessonsProgress: {
              ...cp.lessonsProgress,
              [action.lessonId]: {
                ...lp,
                status: "in-progress",
                activitiesCompleted: completed,
                bestScore: Math.max(lp.bestScore, action.result.score),
              },
            },
          },
        },
      };
      break;
    }

    case "COMPLETE_LESSON": {
      const cp = state.chapterProgress[action.chapterId] ??
        createEmptyChapterProgress(
          action.chapterId,
          action.chapterId === "ch10" ? "available" : "in-progress",
        );
      const lp = cp.lessonsProgress[action.lessonId];
      if (!lp) {
        next = state;
        break;
      }

      const stars = action.score >= 90 ? 3 : action.score >= 75 ? 2 : action.score >= 50 ? 1 : 0;
      const earnedStars = Math.max(cp.starsEarned, stars) as 0 | 1 | 2 | 3;
      const updatedChapter = {
        ...cp,
        status: "completed" as const,
        bestScore: Math.max(cp.bestScore, action.score),
        starsEarned: earnedStars,
        lessonsProgress: {
          ...cp.lessonsProgress,
          [action.lessonId]: {
            ...lp,
            status: "completed" as const,
            bestScore: Math.max(lp.bestScore, action.score),
          },
        },
      };

      const chapterProgress = {
        ...state.chapterProgress,
        [action.chapterId]: updatedChapter,
      };

      const nextChapterId = getNextChapterId(action.chapterId);
      const shouldUnlockNext =
        nextChapterId !== null &&
        ((action.chapterId === "ch10" && earnedStars >= 1) || action.chapterId !== "ch10");

      if (shouldUnlockNext && nextChapterId) {
        const existingNext = chapterProgress[nextChapterId];
        chapterProgress[nextChapterId] = existingNext
          ? { ...existingNext, status: existingNext.status === "completed" ? "completed" : "available" }
          : createEmptyChapterProgress(nextChapterId, "available");
      }

      next = {
        ...state,
        chapterProgress,
        totalStars:
          state.totalStars + Math.max(0, earnedStars - (cp.starsEarned ?? 0)),
      };
      break;
    }

    case "UNLOCK_CHAPTER": {
      const existing = state.chapterProgress[action.chapterId];
      next = {
        ...state,
        chapterProgress: {
          ...state.chapterProgress,
          [action.chapterId]: existing
            ? { ...existing, status: "available" }
            : createEmptyChapterProgress(action.chapterId, "available"),
        },
      };
      break;
    }

    case "ADD_STARS":
      next = { ...state, totalStars: state.totalStars + action.count };
      break;

    case "RESET_PROGRESS":
      next = createDefaultProgress(state.student);
      break;

    default:
      next = state;
  }

  storage.save(next);
  return next;
}

// --- Context ---

interface AppContextValue {
  progress: ProgressStore;
  dispatch: React.Dispatch<ProgressAction>;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  audio: {
    playEffect: (name: SoundEffect) => void;
    toggleMusic: () => void;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// --- Provider ---

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  soundEnabled: true,
  musicEnabled: false,
  devMode: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = storage.load();
  const initialProgress =
    saved ??
    createDefaultProgress({
      id: crypto.randomUUID(),
      name: "",
      avatarId: "default",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });

  const [progress, dispatch] = useReducer(progressReducer, initialProgress);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const playEffect = useCallback(
    (_name: SoundEffect) => {
      if (!settings.soundEnabled) return;
      // TODO: wire up Howler.js when sound assets are added
    },
    [settings.soundEnabled],
  );

  const toggleMusic = useCallback(() => {
    setSettings((prev) => ({ ...prev, musicEnabled: !prev.musicEnabled }));
    // TODO: wire up Howler.js background music
  }, []);

  return (
    <AppContext.Provider
      value={{
        progress,
        dispatch,
        settings,
        updateSettings,
        audio: { playEffect, toggleMusic },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
