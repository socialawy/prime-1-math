import type { ProgressStore } from "../types/curriculum";

const STORAGE_KEY = "mathapp_progress";
const EXAM_STORAGE_KEY = "mathapp_exam_practice";

export const storage = {
  load(): ProgressStore | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ProgressStore) : null;
    } catch {
      return null;
    }
  },

  save(store: ProgressStore): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  loadExamPractice<T>(): T | null {
    try {
      const raw = localStorage.getItem(EXAM_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  saveExamPractice<T>(data: T): void {
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(data));
  },

  clearExamPractice(): void {
    localStorage.removeItem(EXAM_STORAGE_KEY);
  },
};
