import type { ProgressStore } from "../types/curriculum";

const STORAGE_KEY = "mathapp_progress";

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
};
