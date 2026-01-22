import { useNavigate } from "react-router-dom";

function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex flex-col items-center justify-center px-8">
      {/* 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center mb-20">
        {/* 텍스트 로고 */}
        <img
          src="/assets/logo_text.svg"
          alt="FLOCA for ADHD"
          className="h-24 w-auto"
        />
      </div>

      {/* 버튼 영역 */}
      <div className="w-full max-w-sm space-y-4 mb-16">
        <button
          onClick={() => navigate("/auth/splash/login")}
          className="w-full py-4 bg-[#795549] text-[#F5F1EB] text-lg font-medium rounded-full hover:bg-[#5D4037] transition-colors"
        >
          로그인
        </button>
        <button
          onClick={() => navigate("/auth/splash/signup")}
          className="w-full py-4 bg-transparent text-[#795549] text-lg font-medium rounded-full border-2 border-[#795549] hover:bg-[#795549]/10 transition-colors"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default SplashPage;
