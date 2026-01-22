import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  PrimaryPillButton,
  SocialPillButton,
} from "@/components/common/PillButton";
import { useAuthStore } from "@/stores/authStore";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: { redirectUri: string; prompt?: string }) => void;
      };
    };
  }
}

const KAKAO_CLIENT_ID = "154cf295c3f634df0177b3c4d2b53479";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID || "";

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_CLIENT_ID);
    }
  }, []);

  const handleKakaoLogin = () => {
    if (window.Kakao) {
      window.Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/kakao/callback`,
        prompt: "select_account", // 매번 계정 선택 화면 표시
      });
    }
  };

  const handleGoogleLogin = () => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "email profile";
    // prompt=select_account: 매번 계정 선택 화면 표시
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  const handleNaverLogin = () => {
    const redirectUri = `${window.location.origin}/auth/naver/callback`;
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem("naver_state", state);

    // 네이버 OAuth URL (auth_type=reauthenticate: 매번 계정 선택 화면 표시)
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&auth_type=reauthenticate`;
    window.location.href = naverAuthUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      alert("로그인 되었습니다!");
      navigate("/");
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-22">
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <div className="text-6xl text-[#795549] font-bold p-12">Log in</div>

          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 mb-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]"
          />

          <div className="relative w-full mb-2">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#795549]/50 hover:text-[#795549] transition-colors"
            >
              {showPassword ? (
                <Eye className="size-5 cursor-pointer" />
              ) : (
                <EyeOff className="size-5 cursor-pointer" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm w-full text-center mb-2">
              {error}
            </p>
          )}

          <div className="w-full text-right mb-4">
            <Link
              to="/auth/splash/forgot-password"
              className="text-sm text-[#795549] hover:underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <PrimaryPillButton className="w-30" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </PrimaryPillButton>
        </div>

        <div className="flex flex-col w-full max-w-md mx-auto">
          <div className="space-y-3 mb-6">
            <SocialPillButton type="button" onClick={handleKakaoLogin}>카카오 로그인</SocialPillButton>
            <SocialPillButton type="button" onClick={handleGoogleLogin}>구글 로그인</SocialPillButton>
            <SocialPillButton type="button" onClick={handleNaverLogin}>네이버 로그인</SocialPillButton>
          </div>

          <div className="text-center text-sm text-[#795549]">
            <span>계정이 없으신가요? </span>
            <Link to="/auth/splash/signup" className="font-bold underline">
              회원가입
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
