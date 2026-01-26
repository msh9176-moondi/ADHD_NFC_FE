import { create } from 'zustand';

export type MoodKey = 'excited' | 'calm' | 'sleepy' | 'tired' | 'angry';

type MoodLog = {
  date: string; // ISO string
  mood: MoodKey;
};

type MoodState = {
  logs: MoodLog[];
  addMoodLog: (mood: MoodKey, date?: string) => void;
  resetMoodLogs: () => void;
};

export const useMoodStore = create<MoodState>((set) => ({
  logs: [],
  addMoodLog: (mood, date) =>
    set((state) => ({
      logs: [...state.logs, { mood, date: date ?? new Date().toISOString() }],
    })),
  resetMoodLogs: () => set({ logs: [] }),
}));
