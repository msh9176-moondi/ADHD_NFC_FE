import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { useAuthStore } from '@/stores/authStore';

export default function SplashPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  // 로그인된 유저면 바로 reward 페이지로 이동
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/reward', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="flex-1 w-full min-h-screen flex items-center justify-center bg-[#F5F1EB]">
        <div className="text-[#795549]">로딩 중...</div>
      </div>
    );
  }

  return (
    // RootLayout의 main이 이미 flex-1이므로, 여기서는 100vh 잡지 말고 flex-1로만
    <div className="flex-1 w-full min-h-screen flex flex-col items-center bg-[#F5F1EB]">
      {/* 콘텐츠 폭: RootLayout이 w-103을 쓰고 있어서 여기서도 비슷하게 맞추면 안정적 */}
      <div className="w-full flex-1 flex flex-col px-8">
        {/* 로고: header 바로 아래에서 자연스럽게 중앙 정렬 */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/assets/logo.svg"
            alt="FLOCA for ADHD"
            className="h-60 w-auto"
          />
        </div>

        {/* 버튼: footer 위에서 자연스럽게 떠있게 */}
        <div
          className="w-full max-w-sm mx-auto space-y-3 mb-20"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <PrimaryPillButton
            className="w-full h-12"
            onClick={() => navigate('/auth/splash/login')}
          >
            로그인
          </PrimaryPillButton>

          <PrimaryPillButton
            className="w-full h-12"
            onClick={() => navigate('/auth/splash/signup')}
          >
            회원가입
          </PrimaryPillButton>
        </div>
      </div>
    </div>
  );
}
