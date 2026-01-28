import { create } from 'zustand';
import { api } from '@/lib/api';

// 통계 데이터 전용 스토어 (루틴 랭킹, 스트릭, 감정 기록)
// 나무 데이터(level, xp)는 progress.ts에서 관리

interface DailyLogsStatsResponse {
  stats: {
    routineRanking: Array<{ routineId: string; count: number }>;
    totalExecutions: number;
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
  };
}

interface DailyLogsListResponse {
  logs: Array<{
    id: string;
    mood: string;
    date: string;
  }>;
}

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
  fetchStats: () => Promise<void>;
  fetchMoodLogs: () => Promise<void>;
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

  // 통계 데이터 가져오기
  fetchStats: async () => {
    try {
      console.log('[Growth Store] fetchStats 호출');
      const response = await api.get<DailyLogsStatsResponse>('/daily-logs/stats');
      console.log('[Growth Store] API 응답 전체:', response.data);
      const { stats } = response.data;
      console.log('[Growth Store] 통계 데이터 수신:', stats);
      console.log('[Growth Store] routineRanking:', stats.routineRanking);
      console.log('[Growth Store] totalExecutions:', stats.totalExecutions);
      set({
        routineRanking: stats.routineRanking || [],
        totalExecutions: stats.totalExecutions || 0,
        currentStreak: stats.currentStreak || 0,
        longestStreak: stats.longestStreak || 0,
        totalDays: stats.totalDays || 0,
      });
      console.log('[Growth Store] 스토어 업데이트 완료');
    } catch (error) {
      console.error('[Growth Store] 통계 데이터 로드 실패:', error);
    }
  },

  // 감정 기록 가져오기 (이번 달)
  fetchMoodLogs: async () => {
    try {
      console.log('[Growth Store] fetchMoodLogs 호출');
      const response = await api.get<DailyLogsListResponse>('/daily-logs', {
        params: { limit: 31 },
      });
      console.log('[Growth Store] 일일 로그 API 응답:', response.data);
      const { logs } = response.data;
      console.log('[Growth Store] 감정 기록 수신:', logs);
      const moodData = logs.map((log) => ({ date: log.date, mood: log.mood }));
      console.log('[Growth Store] 매핑된 moodLogs:', moodData);
      set({ moodLogs: moodData });
      console.log('[Growth Store] moodLogs 스토어 업데이트 완료');
    } catch (error) {
      console.error('[Growth Store] 감정 기록 로드 실패:', error);
    }
  },

  // 모든 통계 데이터 가져오기
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([get().fetchStats(), get().fetchMoodLogs()]);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
