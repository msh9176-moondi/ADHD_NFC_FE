// src/store/progress.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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

// 레벨 계산 함수
function calculateLevel(totalXp: number): { level: number; currentXp: number; xpToNext: number } {
  let level = 1;
  let remainingXp = totalXp;
  let xpNeeded = 100; // 첫 레벨업에 필요한 XP

  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.2); // 레벨마다 20% 증가
  }

  return { level, currentXp: remainingXp, xpToNext: xpNeeded };
}

// 트리 단계 계산 함수
function calculateTreeStage(level: number): { stage: number; name: string } {
  if (level <= 5) return { stage: 1, name: '씨앗이 자라고 있어요!!' };
  if (level <= 10) return { stage: 2, name: '새싹이 돋아났어요!' };
  if (level <= 20) return { stage: 3, name: '어린 나무가 되었어요!' };
  if (level <= 35) return { stage: 4, name: '나무가 자라고 있어요!' };
  if (level <= 50) return { stage: 5, name: '멋진 나무가 되었어요!' };
  return { stage: 6, name: '거대한 나무로 성장했어요!' };
}

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

        const tree = calculateTreeStage(nextLevel);
        set({
          xp: nextXp,
          level: nextLevel,
          treeStage: tree.stage,
          treeStageName: tree.name,
        });
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

      // Supabase에서 데이터 동기화
      syncFromBackend: async () => {
        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data: userData, error } = await supabase
            .from('users')
            .select('xp, coin_balance')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          const totalXp = userData?.xp ?? 0;
          const coins = userData?.coin_balance ?? 0;

          // XP로부터 레벨 계산
          const levelInfo = calculateLevel(totalXp);
          const tree = calculateTreeStage(levelInfo.level);

          set({
            level: levelInfo.level,
            xp: levelInfo.currentXp,
            xpToNext: levelInfo.xpToNext,
            coins: coins,
            treeStage: tree.stage,
            treeStageName: tree.name,
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
