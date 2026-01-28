import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  CreateDailyLogRequest,
  DailyLog,
  CreateDailyLogResponse,
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
      const response = await api.post<CreateDailyLogResponse>(
        "/daily-logs",
        data
      );
      const { dailyLog } = response.data;
      set({
        lastSavedLog: dailyLog,
        isLoading: false,
      });
      return dailyLog;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "리포트 저장에 실패했습니다.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
