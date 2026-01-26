// src/store/progress.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProgressState = {
  level: number;
  xp: number;
  xpToNext: number;

  coins: number; // ✅ 추가
  addXp: (amount: number) => void;

  addCoins: (amount: number) => void; // ✅ 추가
  spendCoins: (amount: number) => boolean; // ✅ 추가 (구매 시 사용)

  reset: () => void;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpToNext: 100,

      coins: 0, // ✅ 초기값

      addXp: (amount) => {
        const { xp, xpToNext, level } = get();

        let nextXp = xp + amount;
        let nextLevel = level;

        while (nextXp >= xpToNext) {
          nextXp -= xpToNext;
          nextLevel += 1;
        }

        set({ xp: nextXp, level: nextLevel });
      },

      addCoins: (amount) => {
        set((s) => ({ coins: Math.max(0, (s.coins ?? 0) + amount) }));
      },

      spendCoins: (amount) => {
        const { coins } = get();
        if ((coins ?? 0) < amount) return false;
        set({ coins: (coins ?? 0) - amount });
        return true;
      },

      reset: () => set({ level: 1, xp: 0, xpToNext: 100, coins: 0 }),
    }),
    { name: 'progress-store' },
  ),
);
