export type MoodKey = "excited" | "calm" | "sleepy" | "tired" | "angry";

// 일일 리포트 생성 요청 타입
export interface CreateDailyLogRequest {
  mood: MoodKey;
  routineScore: number; // 0~4
  completedRoutines: string[]; // 루틴 ID 배열
  note?: string;
  date?: string; // ISO string, 기본값은 오늘
}

// 일일 리포트 응답 타입
export interface DailyLog {
  id: string;
  userId: string;
  mood: MoodKey;
  routineScore: number;
  completedRoutines: string[];
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// 일일 리포트 생성 응답 타입
export interface CreateDailyLogResponse {
  dailyLog: DailyLog;
}
