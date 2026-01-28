// src/store/progress.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

type ProgressState = {
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  treeStage: number;
  treeStageName: string;
  isLoading: boolean;

  // 액션
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  syncFromBackend: () => Promise<void>;
  reset: () => void;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpToNext: 100,
      coins: 0,
      treeStage: 1,
      treeStageName: '씨앗이 자라고 있어요!!',
      isLoading: false,

      // 로컬 XP 추가 (임시, 백엔드 동기화 전)
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

      // 로컬 코인 추가 (임시, 백엔드 동기화 전)
      addCoins: (amount) => {
        set((s) => ({ coins: Math.max(0, (s.coins ?? 0) + amount) }));
      },

      // 코인 사용
      spendCoins: (amount) => {
        const { coins } = get();
        if ((coins ?? 0) < amount) return false;
        set({ coins: (coins ?? 0) - amount });
        return true;
      },

      // 백엔드에서 데이터 동기화 (진짜 데이터)
      syncFromBackend: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/growth/tree');
          const { tree } = response.data;

          set({
            level: tree.level,
            xp: tree.currentXp,
            xpToNext: tree.xpToNextLevel,
            coins: tree.currentXp, // XP = 코인
            treeStage: tree.treeStage,
            treeStageName: tree.treeStageName,
            isLoading: false,
          });
        } catch (error) {
          console.error('백엔드 동기화 실패:', error);
          set({ isLoading: false });
        }
      },

      reset: () =>
        set({
          level: 1,
          xp: 0,
          xpToNext: 100,
          coins: 0,
          treeStage: 1,
          treeStageName: '씨앗이 자라고 있어요!!',
        }),
    }),
    { name: 'progress-store' },
  ),
);
