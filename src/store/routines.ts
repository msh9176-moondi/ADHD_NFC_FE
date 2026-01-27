import { create } from 'zustand';

type RoutineCounts = Record<string, number>;
type DailyRecord = Record<string, string[]>; // { "2026-01-26": ["water", "walk"] }

type RoutineState = {
  counts: RoutineCounts;
  dailyRecords: DailyRecord; // 날짜별 완료 루틴 기록
  addCompletions: (routineIds: string[]) => void;
  resetCounts: () => void;
};

// 오늘 날짜 YYYY-MM-DD
const getTodayKey = () => new Date().toISOString().split('T')[0];

export const useRoutineStore = create<RoutineState>((set) => ({
  counts: {},
  dailyRecords: {},
  addCompletions: (routineIds) =>
    set((state) => {
      const today = getTodayKey();
      const previousToday = state.dailyRecords[today] || [];

      // 오늘 이전에 기록한 루틴들은 카운트에서 빼기
      const next = { ...state.counts };
      for (const id of previousToday) {
        if (next[id] && next[id] > 0) {
          next[id] -= 1;
        }
      }

      // 새로 선택한 루틴들 카운트 추가
      for (const id of routineIds) {
        next[id] = (next[id] ?? 0) + 1;
      }

      return {
        counts: next,
        dailyRecords: { ...state.dailyRecords, [today]: routineIds },
      };
    }),
  resetCounts: () => set({ counts: {}, dailyRecords: {} }),
}));
