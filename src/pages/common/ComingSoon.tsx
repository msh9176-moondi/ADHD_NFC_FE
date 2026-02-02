import { useNavigate, useLocation } from 'react-router-dom';
import { PrimaryPillButton } from '@/components/common/PillButton';

const PAGE_TITLES: Record<string, string> = {
  '/coming-soon/expert-report': '전문가 분석 기반 ADHD 패턴 리포트',
  '/coming-soon/hospital': '병원 연계 서비스',
};

export default function ComingSoonPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || '서비스';

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#F5F0E5] flex items-center justify-center">
          <span className="text-[48px]" aria-hidden>
            🚧
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-[18px] font-bold text-[#795549] mb-2">
          {title}
        </h1>

        {/* 설명 */}
        <p className="text-[14px] text-[#795549]/80 mb-2">
          현재 준비 중인 서비스입니다
        </p>
        <p className="text-[13px] text-[#795549]/60 mb-8 leading-relaxed">
          더 나은 서비스를 위해 열심히 준비하고 있어요.
          <br />
          조금만 기다려 주세요!
        </p>

        {/* 돌아가기 버튼 */}
        <PrimaryPillButton
          className="w-full max-w-xs mx-auto h-12 text-[14px] font-semibold"
          onClick={() => navigate(-1)}
        >
          이전 페이지로 돌아가기
        </PrimaryPillButton>
      </div>
    </div>
  );
}
