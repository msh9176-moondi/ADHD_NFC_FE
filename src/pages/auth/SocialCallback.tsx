import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore, type AppUser } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Asterisk } from "lucide-react";
import { SocialPillButton } from "@/components/common/PillButton";

type Step = "loading" | "agreement" | "processing";

interface SocialCallbackProps {
  providerName: string;
}

function SocialCallbackPage({ providerName }: SocialCallbackProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 약관 동의 상태
  const [termsOfService, setTermsOfService] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // 플래너 번호
  const [plannerNumber, setPlannerNumber] = useState("");

  const allChecked = termsOfService && privacyPolicy && marketing;
  const requiredChecked = termsOfService && privacyPolicy;

  const handleAllCheck = (checked: boolean) => {
    setTermsOfService(checked);
    setPrivacyPolicy(checked);
    setMarketing(checked);
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase OAuth 콜백 처리 (URL에서 토큰 추출)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          // 세션이 없으면 에러
          setError("인증에 실패했습니다.");
          setTimeout(() => navigate("/auth/splash/login"), 2000);
          return;
        }

        const user = session.user;
        setUserId(user.id);
        setUserEmail(user.email || null);

        // users 테이블에 사용자 정보가 있는지 확인
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 = no rows returned (신규 사용자)
          throw fetchError;
        }

        if (existingUser) {
          // 기존 사용자: 바로 로그인 처리
          useAuthStore.setState({
            supabaseUser: user,
            user: existingUser as AppUser,
            isAuthenticated: true,
            isLoading: false,
          });
          navigate("/reward");
        } else {
          // 신규 사용자: 약관 동의 화면 표시
          setStep("agreement");
        }
      } catch (err: any) {
        console.error(`${providerName} 로그인 에러:`, err);
        setError(err.message || `${providerName} 로그인에 실패했습니다.`);
        setTimeout(() => navigate("/auth/splash/login"), 2000);
      }
    };

    handleCallback();
  }, [navigate, providerName]);

  // 동의하기 버튼 클릭
  const handleAgree = async () => {
    if (!requiredChecked) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    if (!userId) return;

    setStep("processing");

    try {
      // users 테이블에 사용자 정보 저장
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: userEmail,
          planner_number: plannerNumber || null,
        });

      if (insertError) throw insertError;

      // 약관 동의 저장
      const agreements = [
        { user_id: userId, type: "terms_of_service", is_agreed: termsOfService, agreed_at: new Date().toISOString() },
        { user_id: userId, type: "privacy_policy", is_agreed: privacyPolicy, agreed_at: new Date().toISOString() },
        { user_id: userId, type: "marketing", is_agreed: marketing, agreed_at: new Date().toISOString() },
      ];

      await supabase.from("user_agreements").insert(agreements);

      // 생성된 사용자 정보 조회
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      useAuthStore.setState({
        supabaseUser: supabaseUser,
        user: userData as AppUser,
        isAuthenticated: true,
        isLoading: false,
      });

      alert("회원가입이 완료되었습니다!");
      navigate("/reward");
    } catch (err: any) {
      console.error("회원가입 에러:", err);
      setError(err.message || "회원가입에 실패했습니다.");
      setStep("agreement");
    }
  };

  // 취소 버튼 클릭
  const handleCancel = async () => {
    await supabase.auth.signOut();
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
          {step === "loading" ? `${providerName} 로그인 처리 중...` : "회원가입 처리 중..."}
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
            <span className="font-bold">{providerName}</span> 계정으로 회원가입합니다.
          </p>
          <p className="text-[#795549]/60 text-xs mt-1">
            약관에 동의하시면 회원가입이 완료됩니다.
          </p>
        </div>

        {/* 플래너 고유 번호 (선택) */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-1 mb-2 pl-4">
            <label className="text-sm font-bold text-[#795549]">
              플래너 고유 번호 (선택)
            </label>
          </div>
          <Input
            type="text"
            placeholder="#으로 시작하는 플래너 번호"
            value={plannerNumber}
            onChange={(e) => setPlannerNumber(e.target.value)}
            className="w-full h-12 px-4 border-none bg-[#F5F5F5] rounded-full focus-visible:border-[#795549] focus-visible:ring-[#795549]/20 text-[#795549] placeholder:text-[#795549]/50"
          />
          <p className="text-[#795549]/60 text-xs mt-1 pl-4">
            플래너가 있다면 고유 번호를 입력해주세요.
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

// 각 Provider별 컴포넌트
export function GoogleCallbackPage() {
  return <SocialCallbackPage providerName="구글" />;
}

export function KakaoCallbackPage() {
  return <SocialCallbackPage providerName="카카오" />;
}

export function NaverCallbackPage() {
  return <SocialCallbackPage providerName="네이버" />;
}

export default SocialCallbackPage;
