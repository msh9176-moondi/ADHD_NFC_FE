import { create } from 'zustand';

export type MoodKey = 'excited' | 'calm' | 'sleepy' | 'tired' | 'angry';

type MoodLog = {
  date: string; // YYYY-MM-DD
  mood: MoodKey;
};

type MoodState = {
  logs: MoodLog[];
  addMoodLog: (mood: MoodKey, date?: string) => void;
  resetMoodLogs: () => void;
};

// 날짜를 YYYY-MM-DD 형식으로 변환
const getDateKey = (date?: string) => {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().split('T')[0];
};

export const useMoodStore = create<MoodState>((set) => ({
  logs: [],
  addMoodLog: (mood, date) =>
    set((state) => {
      const dateKey = getDateKey(date);
      // 같은 날짜가 있으면 업데이트, 없으면 추가
      const existingIndex = state.logs.findIndex((log) => log.date === dateKey);
      if (existingIndex >= 0) {
        const newLogs = [...state.logs];
        newLogs[existingIndex] = { mood, date: dateKey };
        return { logs: newLogs };
      }
      return { logs: [...state.logs, { mood, date: dateKey }] };
    }),
  resetMoodLogs: () => set({ logs: [] }),
}));
