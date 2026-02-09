import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useProgressStore } from "@/store/progress";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// 앱 내 사용자 타입 (users 테이블 기반)
export interface AppUser {
  id: string;
  email: string | null;
  role: "user" | "admin" | "expert" | "seller";
  nickname: string | null;
  profile_image: string | null;
  real_name: string | null;
  phone: string | null;
  zip_code: string | null;
  address: string | null;
  address_detail: string | null;
  delivery_request: string | null;
  coin_balance: number;
  xp: number;
  total_tag_count: number;
  planner_number: string | null;
}

interface AuthState {
  // 상태
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  socialLogin: (provider: "google" | "kakao") => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateAddress: (data: UpdateAddressData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  agreeTermsOfService: boolean;
  agreePrivacyPolicy: boolean;
  agreeMarketing: boolean;
  plannerNumber?: string;
}

interface UpdateProfileData {
  nickname?: string;
  real_name?: string;
  phone?: string;
  profile_image?: string;
}

interface UpdateAddressData {
  zip_code?: string;
  address?: string;
  address_detail?: string;
  delivery_request?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      supabaseUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 앱 초기화 시 세션 확인
      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            // users 테이블에서 추가 정보 조회
            const { data: userData, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (!error && userData) {
              set({
                supabaseUser: session.user,
                user: userData as AppUser,
                isAuthenticated: true,
              });
              useProgressStore.getState().syncFromBackend();
            }
          }
        } catch (error) {
          console.error("세션 초기화 실패:", error);
        } finally {
          set({ isLoading: false });
        }

        // 인증 상태 변화 리스너
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const { data: userData } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (userData) {
              set({
                supabaseUser: session.user,
                user: userData as AppUser,
                isAuthenticated: true,
              });
              useProgressStore.getState().syncFromBackend();
            }
          } else if (event === "SIGNED_OUT") {
            set({
              supabaseUser: null,
              user: null,
              isAuthenticated: false,
            });
            useProgressStore.getState().reset();
          }
        });
      },

      // 이메일 로그인
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // users 테이블에서 추가 정보 조회
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", data.user.id)
              .single();

            if (userError) throw userError;

            set({
              supabaseUser: data.user,
              user: userData as AppUser,
              isAuthenticated: true,
              isLoading: false,
            });

            useProgressStore.getState().reset();
            useProgressStore.getState().syncFromBackend();
          }
        } catch (error: any) {
          const message = error.message || "로그인에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 이메일 회원가입
      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
          });

          if (authError) throw authError;

          if (authData.user) {
            // users 테이블에 추가 정보 저장
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                id: authData.user.id,
                email: data.email,
                planner_number: data.plannerNumber || null,
              });

            if (insertError) throw insertError;

            // 약관 동의 저장
            const agreements = [
              { user_id: authData.user.id, type: "terms_of_service", is_agreed: data.agreeTermsOfService, agreed_at: new Date().toISOString() },
              { user_id: authData.user.id, type: "privacy_policy", is_agreed: data.agreePrivacyPolicy, agreed_at: new Date().toISOString() },
              { user_id: authData.user.id, type: "marketing", is_agreed: data.agreeMarketing, agreed_at: new Date().toISOString() },
            ];

            await supabase.from("user_agreements").insert(agreements);

            // 생성된 사용자 정보 조회
            const { data: userData } = await supabase
              .from("users")
              .select("*")
              .eq("id", authData.user.id)
              .single();

            set({
              supabaseUser: authData.user,
              user: userData as AppUser,
              isAuthenticated: true,
              isLoading: false,
            });

            useProgressStore.getState().reset();
            useProgressStore.getState().syncFromBackend();
          }
        } catch (error: any) {
          const message = error.message || "회원가입에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 소셜 로그인
      socialLogin: async (provider) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/${provider}/callback`,
            },
          });

          if (error) throw error;
          // 리다이렉트되므로 여기서 상태 업데이트 안 함
        } catch (error: any) {
          const message = error.message || "소셜 로그인에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        useProgressStore.getState().reset();

        const { error } = await supabase.auth.signOut();
        if (error) console.error("로그아웃 오류:", error);

        set({
          supabaseUser: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 사용자 정보 조회
      fetchUser: async () => {
        const { supabaseUser } = get();
        if (!supabaseUser) return;

        set({ isLoading: true, error: null });
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", supabaseUser.id)
            .single();

          if (error) throw error;

          set({ user: userData as AppUser, isLoading: false });
        } catch (error: any) {
          const message = error.message || "정보 조회에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 프로필 수정
      updateProfile: async (data) => {
        const { supabaseUser } = get();
        if (!supabaseUser) return;

        set({ isLoading: true, error: null });
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .update(data)
            .eq("id", supabaseUser.id)
            .select()
            .single();

          if (error) throw error;

          set({ user: userData as AppUser, isLoading: false });
        } catch (error: any) {
          const message = error.message || "프로필 수정에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 배송지 수정
      updateAddress: async (data) => {
        const { supabaseUser } = get();
        if (!supabaseUser) return;

        set({ isLoading: true, error: null });
        try {
          const { data: userData, error } = await supabase
            .from("users")
            .update(data)
            .eq("id", supabaseUser.id)
            .select()
            .single();

          if (error) throw error;

          set({ user: userData as AppUser, isLoading: false });
        } catch (error: any) {
          const message = error.message || "배송지 수정에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 비밀번호 찾기
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) throw error;
          set({ isLoading: false });
        } catch (error: any) {
          const message = error.message || "비밀번호 찾기에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 비밀번호 재설정
      resetPassword: async (password) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.updateUser({
            password,
          });

          if (error) throw error;
          set({ isLoading: false });
        } catch (error: any) {
          const message = error.message || "비밀번호 재설정에 실패했습니다.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
