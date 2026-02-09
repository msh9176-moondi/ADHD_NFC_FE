import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  CreateDailyLogRequest,
  DailyLog,
} from "@/types/report.types";

interface ReportState {
  // 상태
  isLoading: boolean;
  error: string | null;
  lastSavedLog: DailyLog | null;

  // 액션
  saveDailyLog: (data: CreateDailyLogRequest) => Promise<DailyLog>;
  clearError: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  // 초기 상태
  isLoading: false,
  error: null,
  lastSavedLog: null,

  // 일일 리포트 저장
  saveDailyLog: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const date = data.date || new Date().toISOString().split('T')[0];

      // 기존 데이터 확인 (같은 날짜)
      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      let result;
      const logData = {
        user_id: user.id,
        mood: data.mood,
        routine_score: data.routineScore,
        completed_routines: data.completedRoutines,
        note: data.note || null,
        date: date,
      };

      if (existing) {
        // 업데이트
        result = await supabase
          .from('daily_logs')
          .update(logData)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // 새로 생성
        result = await supabase
          .from('daily_logs')
          .insert(logData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const dailyLog: DailyLog = {
        id: result.data.id,
        userId: result.data.user_id,
        mood: result.data.mood,
        routineScore: result.data.routine_score,
        completedRoutines: result.data.completed_routines || [],
        note: result.data.note,
        date: result.data.date,
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at,
      };

      set({
        lastSavedLog: dailyLog,
        isLoading: false,
      });

      return dailyLog;
    } catch (error: any) {
      const message = error.message || "리포트 저장에 실패했습니다.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
