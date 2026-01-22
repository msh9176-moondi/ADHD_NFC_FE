import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Asterisk } from "lucide-react";
import { SocialPillButton } from "@/components/common/PillButton";

interface NaverProfile {
  id: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
}

interface NaverCallbackResponse {
  needsSignup: boolean;
  socialProfile?: NaverProfile;
  provider?: string;
  socialAccessToken?: string;
  accessToken?: string;
  user?: any;
}

function NaverCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"loading" | "agreement" | "processing">("loading");
  const isProcessing = useRef(false);

  // 네이버 프로필 정보
  const [naverProfile, setNaverProfile] = useState<NaverProfile | null>(null);
  const [socialAccessToken, setSocialAccessToken] = useState<string>("");

  // 약관 동의 상태
  const [termsOfService, setTermsOfService] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const allChecked = termsOfService && privacyPolicy && marketing;
  const requiredChecked = termsOfService && privacyPolicy;

  const handleAllCheck = (checked: boolean) => {
    setTermsOfService(checked);
    setPrivacyPolicy(checked);
    setMarketing(checked);
  };

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("네이버 로그인이 취소되었습니다.");
      setTimeout(() => navigate("/auth/splash/login"), 2000);
      return;
    }

    if (!code) {
      setError("인증 코드가 없습니다.");
      setTimeout(() => navigate("/auth/splash/login"), 2000);
      return;
    }

    const handleNaverCallback = async () => {
      try {
        const response = await api.post<NaverCallbackResponse>("/auth/naver/callback", { code, state });
        console.log("네이버 로그인 응답:", response.data);

        if (response.data.needsSignup) {
          // 신규 유저: 동의 화면 표시
          const { socialProfile, socialAccessToken: token } = response.data;
          if (socialProfile && token) {
            setNaverProfile(socialProfile);
            setSocialAccessToken(token);
            setStep("agreement");
          }
        } else {
          // 기존 유저: 바로 로그인 처리
          const { accessToken, user } = response.data;
          if (accessToken && user) {
            useAuthStore.getState().setAuth(accessToken, user);
            navigate("/");
          }
        }
      } catch (err: any) {
        console.error("네이버 로그인 에러:", err);
        setError(err.response?.data?.message || "네이버 로그인에 실패했습니다.");
        setTimeout(() => navigate("/auth/splash/login"), 2000);
      }
    };

    handleNaverCallback();
  }, [searchParams, navigate]);

  // 동의하기 버튼 클릭
  const handleAgree = async () => {
    if (!requiredChecked) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    if (!naverProfile) return;

    setStep("processing");

    try {
      const response = await api.post("/auth/social-signup", {
        provider: "naver",
        providerId: naverProfile.id,
        socialAccessToken: socialAccessToken,
        email: naverProfile.email,
        nickname: naverProfile.nickname,
        profileImage: naverProfile.profileImage,
        agreements: {
          termsOfService: termsOfService,
          privacyPolicy: privacyPolicy,
          marketing: marketing,
        },
      });

      const { accessToken, user } = response.data;
      useAuthStore.getState().setAuth(accessToken, user);
      navigate("/");
    } catch (err: any) {
      console.error("회원가입 에러:", err);
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
      setStep("agreement");
    }
  };

  // 취소 버튼 클릭
  const handleCancel = () => {
    navigate("/auth/splash/login");
  };

  // 에러 화면
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
        <p className="text-[#795549] mt-2">로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  // 로딩 화면
  if (step === "loading" || step === "processing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-[#795549] text-lg">
          {step === "loading" ? "네이버 로그인 처리 중..." : "회원가입 처리 중..."}
        </div>
        <div className="mt-4 w-8 h-8 border-4 border-[#795549] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 동의 화면
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="w-full flex flex-col items-center">
        {/* 타이틀 */}
        <div className="text-6xl text-[#795549] font-bold p-12">Sign up</div>

        {/* 소셜 회원가입 안내 */}
        <div className="w-full mb-6 p-4 bg-[#F5F5F5] rounded-2xl text-center">
          <p className="text-[#795549] text-sm">
            <span className="font-bold">네이버</span> 계정으로 회원가입합니다.
          </p>
          <p className="text-[#795549]/60 text-xs mt-1">
            약관에 동의하시면 회원가입이 완료됩니다.
          </p>
        </div>

        {/* 약관 동의 */}
        <div className="w-full mb-16 space-y-3">
          {/* 전체 동의 */}
          <div className="flex items-center gap-3 pl-2 pb-2 border-b border-[#795549]/20">
            <Checkbox
              id="allAgree"
              checked={allChecked}
              onCheckedChange={(checked) => handleAllCheck(checked === true)}
            />
            <label
              htmlFor="allAgree"
              className="text-md text-[#795549] font-bold cursor-pointer"
            >
              전체 동의
            </label>
          </div>

          {/* 서비스 이용약관 동의 (필수) */}
          <div className="flex items-center gap-3 pl-2">
            <Checkbox
              id="termsOfService"
              checked={termsOfService}
              onCheckedChange={(checked) => setTermsOfService(checked === true)}
            />
            <label
              htmlFor="termsOfService"
              className="text-sm text-[#795549] cursor-pointer flex items-center gap-1"
            >
              <Asterisk className="text-red-500 size-3.5" />
              (필수) 서비스 이용약관 동의
            </label>
          </div>

          {/* 개인정보 처리방침 동의 (필수) */}
          <div className="flex items-center gap-3 pl-2">
            <Checkbox
              id="privacyPolicy"
              checked={privacyPolicy}
              onCheckedChange={(checked) => setPrivacyPolicy(checked === true)}
            />
            <label
              htmlFor="privacyPolicy"
              className="text-sm text-[#795549] cursor-pointer flex items-center gap-1"
            >
              <Asterisk className="text-red-500 size-3.5" />
              (필수) 개인정보 처리방침 동의
            </label>
          </div>

          {/* 마케팅 및 광고 수신 동의 (선택) */}
          <div className="flex items-center gap-3 pl-2">
            <Checkbox
              id="marketing"
              checked={marketing}
              onCheckedChange={(checked) => setMarketing(checked === true)}
            />
            <label
              htmlFor="marketing"
              className="text-sm text-[#795549] cursor-pointer"
            >
              (선택) 마케팅 및 광고 수신 동의
            </label>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="w-full flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 h-12 rounded-full bg-[#F5F5F5] text-[#795549] font-bold hover:bg-[#E0E0E0] transition-colors"
          >
            취소
          </button>
          <SocialPillButton
            onClick={handleAgree}
            disabled={!requiredChecked}
            className="flex-1 text-lg font-bold cursor-pointer"
          >
            동의하기
          </SocialPillButton>
        </div>
      </div>
    </div>
  );
}

export default NaverCallbackPage;
