import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import { useProgressStore } from "@/store/progress";
import type {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  SocialLoginRequest,
  SocialSignupCompleteRequest,
  UpdateProfileRequest,
  UpdateAddressRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth.types";

interface AuthState {
  // 상태
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  socialLogin: (data: SocialLoginRequest) => Promise<{ needsSignup: boolean }>;
  socialSignupComplete: (data: SocialSignupCompleteRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateAddress: (data: UpdateAddressRequest) => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  setAuth: (accessToken: string, user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 이메일 로그인
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<LoginResponse>("/auth/login", data);
          const { accessToken, user } = response.data;
          set({
            accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // 로그인 성공 후 progress 데이터 백엔드 동기화
          useProgressStore.getState().reset();
          useProgressStore.getState().syncFromBackend();
        } catch (error: any) {
          const message =
            error.response?.data?.message || "로그인에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 이메일 회원가입
      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<SignupResponse>("/auth/signup", data);
          const { accessToken, user } = response.data;
          set({
            accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // 회원가입 성공 후 progress 데이터 초기화 및 동기화
          useProgressStore.getState().reset();
          useProgressStore.getState().syncFromBackend();
        } catch (error: any) {
          const message =
            error.response?.data?.message || "회원가입에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 소셜 로그인
      socialLogin: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<LoginResponse | { needsSignup: true }>(
            "/auth/social",
            data
          );

          // 추가 회원가입이 필요한 경우 (약관 동의 필요)
          if ("needsSignup" in response.data && response.data.needsSignup) {
            set({ isLoading: false });
            return { needsSignup: true };
          }

          const { accessToken, user } = response.data as LoginResponse;
          set({
            accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // 소셜 로그인 성공 후 progress 데이터 초기화 및 동기화
          useProgressStore.getState().reset();
          useProgressStore.getState().syncFromBackend();

          return { needsSignup: false };
        } catch (error: any) {
          const message =
            error.response?.data?.message || "소셜 로그인에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 소셜 로그인 회원가입 완료 (약관 동의 후)
      socialSignupComplete: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<SignupResponse>(
            "/auth/social/complete",
            data
          );
          const { accessToken, user } = response.data;
          set({
            accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // 소셜 회원가입 완료 후 progress 데이터 초기화 및 동기화
          useProgressStore.getState().reset();
          useProgressStore.getState().syncFromBackend();
        } catch (error: any) {
          const message =
            error.response?.data?.message || "회원가입 완료에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 로그아웃
      logout: () => {
        // progress 스토어 초기화 (XP, 코인 등 로컬 캐시 삭제)
        useProgressStore.getState().reset();

        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 내 정보 조회
      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        set({ isLoading: true, error: null });
        try {
          const response = await api.get<User>("/auth/me");
          set({ user: response.data, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "정보 조회에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 프로필 수정
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch<User>("/users/me", data);
          set({ user: response.data, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "프로필 수정에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 배송지 수정
      updateAddress: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch<User>("/users/me/address", data);
          set({ user: response.data, isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "배송지 수정에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 비밀번호 찾기
      forgotPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/forgot-password", data);
          set({ isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "비밀번호 찾기에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 비밀번호 재설정
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/reset-password", data);
          set({ isLoading: false });
        } catch (error: any) {
          const message =
            error.response?.data?.message || "비밀번호 재설정에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 인증 상태 직접 설정 (소셜 로그인 콜백용)
      setAuth: (accessToken, user) => {
        set({
          accessToken,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // 인증 설정 후 progress 데이터 초기화 및 동기화
        useProgressStore.getState().reset();
        useProgressStore.getState().syncFromBackend();
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
