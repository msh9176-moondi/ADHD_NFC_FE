import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// 통계 데이터 전용 스토어 (루틴 랭킹, 스트릭, 감정 기록)
// 나무 데이터(level, xp)는 progress.ts에서 관리

interface GrowthState {
  // 통계 데이터
  routineRanking: Array<{ routineId: string; count: number }>;
  totalExecutions: number;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;

  // 감정 기록 (이번 달)
  moodLogs: Array<{ date: string; mood: string }>;

  // 로딩 상태
  isLoading: boolean;

  // 액션
  fetchStats: (userId?: string) => Promise<void>;
  fetchMoodLogs: (userId?: string) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  // 초기값
  routineRanking: [],
  totalExecutions: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalDays: 0,
  moodLogs: [],
  isLoading: false,

  // 통계 데이터 가져오기 (userId를 파라미터로 받아 중복 getUser 방지)
  fetchStats: async (userId?: string) => {
    try {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        uid = user.id;
      }

      // 모든 daily_logs 가져오기
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('date, completed_routines')
        .eq('user_id', uid)
        .order('date', { ascending: true });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        set({
          routineRanking: [],
          totalExecutions: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
        });
        return;
      }

      // 루틴 랭킹 계산
      const routineCounts: Record<string, number> = {};
      let totalExecutions = 0;

      for (const log of logs) {
        const routines = log.completed_routines || [];
        for (const routineId of routines) {
          routineCounts[routineId] = (routineCounts[routineId] || 0) + 1;
          totalExecutions++;
        }
      }

      const routineRanking = Object.entries(routineCounts)
        .map(([routineId, count]) => ({ routineId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 스트릭 계산
      const dates = logs.map(log => log.date).sort();
      const totalDays = dates.length;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // 연속 기록 계산
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // 현재 스트릭 (오늘 또는 어제부터 시작)
      const lastDate = dates[dates.length - 1];
      if (lastDate === today || lastDate === yesterday) {
        currentStreak = tempStreak;
      }

      set({
        routineRanking,
        totalExecutions,
        currentStreak,
        longestStreak,
        totalDays,
      });
    } catch (error) {
      console.error('[Growth Store] 통계 데이터 로드 실패:', error);
    }
  },

  // 감정 기록 가져오기 (이번 달, userId를 파라미터로 받아 중복 getUser 방지)
  fetchMoodLogs: async (userId?: string) => {
    try {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        uid = user.id;
      }

      // 이번 달의 시작과 끝
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('date, mood')
        .eq('user_id', uid)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: true });

      if (error) throw error;

      const moodData = (logs || []).map((log) => ({
        date: log.date,
        mood: log.mood,
      }));

      set({ moodLogs: moodData });
    } catch (error) {
      console.error('[Growth Store] 감정 기록 로드 실패:', error);
    }
  },

  // 모든 통계 데이터 가져오기 (getUser 1회만 호출 후 병렬 실행)
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // userId를 전달하여 중복 getUser 호출 방지 + 병렬 실행
      await Promise.all([
        get().fetchStats(user.id),
        get().fetchMoodLogs(user.id)
      ]);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
