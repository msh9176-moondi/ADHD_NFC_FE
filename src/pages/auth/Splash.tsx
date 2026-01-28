import { useNavigate } from 'react-router-dom';
import { PrimaryPillButton } from '@/components/common/PillButton';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="page bg-[#F5F1EB]">
      <div className="container flex flex-col px-8">
        {/* 로고 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center mb-20">
          <img
            src="/assets/logo_text.svg"
            alt="FLOCA for ADHD"
            className="h-24 w-auto"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="w-full max-w-sm mx-auto space-y-3 mb-16">
          <PrimaryPillButton
            className="w-full h-12"
            onClick={() => navigate('/auth/splash/login')}
          >
            로그인
          </PrimaryPillButton>

          <PrimaryPillButton
            className="w-full h-12 bg-transparent text-[#795549] border-2 border-[#795549] hover:bg-[#795549]/10"
            onClick={() => navigate('/auth/splash/signup')}
          >
            회원가입
          </PrimaryPillButton>
        </div>
      </div>
    </div>
  );
}
