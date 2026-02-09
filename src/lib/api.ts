// 이 파일은 Supabase로 마이그레이션되어 더 이상 사용되지 않습니다.
// 호환성을 위해 유지합니다.

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
