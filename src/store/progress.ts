// src/store/progress.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProgressState = {
  level: number;
  xp: number; // 현재 레벨에서의 XP
  xpToNext: number; // 레벨업에 필요한 XP (고정/가변 가능)
  addXp: (amount: number) => void;
  reset: () => void;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpToNext: 100,

      addXp: (amount) => {
        const { xp, xpToNext, level } = get();

        let nextXp = xp + amount;
        let nextLevel = level;

        // 레벨업 처리 (넘친 xp는 이월)
        while (nextXp >= xpToNext) {
          nextXp -= xpToNext;
          nextLevel += 1;
        }

        set({ xp: nextXp, level: nextLevel });
      },

      reset: () => set({ level: 1, xp: 0, xpToNext: 100 }),
    }),
    { name: 'progress-store' }
  )
);
