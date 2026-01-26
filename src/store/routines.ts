import { create } from 'zustand';

type RoutineCounts = Record<string, number>;

type RoutineState = {
  counts: RoutineCounts;
  addCompletions: (routineIds: string[]) => void;
  resetCounts: () => void;
};

export const useRoutineStore = create<RoutineState>((set) => ({
  counts: {},
  addCompletions: (routineIds) =>
    set((state) => {
      const next = { ...state.counts };
      for (const id of routineIds) {
        next[id] = (next[id] ?? 0) + 1;
      }
      return { counts: next };
    }),
  resetCounts: () => set({ counts: {} }),
}));
