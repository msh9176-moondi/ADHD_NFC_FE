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

          // 백엔드에서 계산된 레벨과 XP 사용
          const level = tree.level;
          const remaining = tree.xpToNextLevel;
          const percent = tree.progressPercent;
          // 현재 레벨의 총 필요 XP 역산 (remaining = total * (1 - percent/100))
          const totalForLevel = percent > 0
            ? Math.round(remaining / (1 - percent / 100))
            : remaining;
          const progressXp = totalForLevel - remaining;

          set({
            level: level,
            xp: progressXp,
            xpToNext: totalForLevel,
            coins: tree.coins, // 별도 코인 필드 사용
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
