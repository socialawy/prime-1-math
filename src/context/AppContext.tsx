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

function createDefaultProgress(student: StudentProfile): ProgressStore {
  return {
    student,
    chapterProgress: {},
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
      const cp = state.chapterProgress[action.chapterId] ?? {
        chapterId: action.chapterId,
        status: "in-progress" as const,
        lessonsProgress: {},
        bestScore: 0,
        starsEarned: 0 as const,
      };
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
      const cp = state.chapterProgress[action.chapterId];
      if (!cp) {
        next = state;
        break;
      }
      const lp = cp.lessonsProgress[action.lessonId];
      if (!lp) {
        next = state;
        break;
      }

      const stars = action.score >= 90 ? 3 : action.score >= 70 ? 2 : 1;

      next = {
        ...state,
        chapterProgress: {
          ...state.chapterProgress,
          [action.chapterId]: {
            ...cp,
            lessonsProgress: {
              ...cp.lessonsProgress,
              [action.lessonId]: {
                ...lp,
                status: "completed",
                bestScore: Math.max(lp.bestScore, action.score),
              },
            },
          },
        },
        totalStars:
          state.totalStars + Math.max(0, stars - (cp.starsEarned ?? 0)),
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
            : {
                chapterId: action.chapterId,
                status: "available",
                lessonsProgress: {},
                bestScore: 0,
                starsEarned: 0,
              },
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
  language: "ar",
  soundEnabled: true,
  musicEnabled: false,
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
