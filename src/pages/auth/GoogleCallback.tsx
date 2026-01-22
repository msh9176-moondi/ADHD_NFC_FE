import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    // StrictMode에서 중복 호출 방지
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("구글 로그인이 취소되었습니다.");
      setTimeout(() => navigate("/auth/splash/login"), 2000);
      return;
    }

    if (!code) {
      setError("인증 코드가 없습니다.");
      setTimeout(() => navigate("/auth/splash/login"), 2000);
      return;
    }

    const handleGoogleCallback = async () => {
      try {
        const response = await api.post("/auth/google/callback", { code });

        if (response.data.needsSignup) {
          // 신규 유저: 회원가입 페이지로 이동
          const { socialProfile, provider, socialAccessToken } = response.data;
          sessionStorage.setItem(
            "socialSignupData",
            JSON.stringify({ socialProfile, provider, socialAccessToken })
          );
          navigate("/auth/splash/signup?social=true");
        } else {
          // 기존 유저: 로그인 처리
          const { accessToken, user } = response.data;
          useAuthStore.getState().setAuth(accessToken, user);
          alert("구글 로그인 성공!");
          navigate("/");
        }
      } catch (err: any) {
        console.error("구글 로그인 에러:", err);
        setError(err.response?.data?.message || "구글 로그인에 실패했습니다.");
        setTimeout(() => navigate("/auth/splash/login"), 2000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
        <p className="text-[#795549] mt-2">로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-[#795549] text-lg">구글 로그인 처리 중...</div>
      <div className="mt-4 w-8 h-8 border-4 border-[#795549] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default GoogleCallbackPage;
