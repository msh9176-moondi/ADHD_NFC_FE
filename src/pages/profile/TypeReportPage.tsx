import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PrimaryPillButton } from '@/components/common/PillButton';
import {
  TYPE_REPORTS,
  TYPE_LABELS,
  type AdhdTypeKey,
} from '@/data/typeReports';
import {
  Sparkles,
  Brain,
  Target,
  ListChecks,
  ChevronLeft,
  Zap,
  Focus,
  Layers,
  Home,
  Flame,
  HeartHandshake,
} from 'lucide-react';

// 타입별 아이콘 매핑
const TYPE_ICONS: Record<AdhdTypeKey, React.ReactNode> = {
  attention: <Focus className="w-6 h-6" />,
  impulsive: <Zap className="w-6 h-6" />,
  complex: <Layers className="w-6 h-6" />,
  environment: <Home className="w-6 h-6" />,
  motivational: <Flame className="w-6 h-6" />,
  emotional: <HeartHandshake className="w-6 h-6" />,
};

// 유효한 타입인지 확인
const isValidType = (type: string): type is AdhdTypeKey => {
  return type in TYPE_REPORTS;
};

function TypeReportPage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  // 유효하지 않은 타입이면 프로필로 리다이렉트
  if (!type || !isValidType(type)) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">🤔</div>
          <h2 className="text-lg font-semibold text-[#795549] mb-2">
            존재하지 않는 성향 타입이에요
          </h2>
          <p className="text-sm text-[#795549]/70 mb-4">
            올바른 경로로 다시 접근해주세요.
          </p>
          <PrimaryPillButton onClick={() => navigate('/profile')}>
            프로필로 돌아가기
          </PrimaryPillButton>
        </div>
      </div>
    );
  }

  const report = TYPE_REPORTS[type];

  return (
    <div className="w-full px-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* 헤더 - 뒤로가기 */}
        <div className="pt-4 pb-2">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1 text-[#795549]/70 hover:text-[#795549] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">프로필로 돌아가기</span>
          </button>
        </div>

        {/* 타이틀 섹션 */}
        <div className="pt-4 pb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DBA67A]/20 rounded-full mb-3">
            <span className="text-[#795549]">{TYPE_ICONS[type]}</span>
            <span className="text-xs font-medium text-[#795549]">
              {report.badge}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#795549]">{report.pageTitle}</h1>
          {report.subtitle && (
            <p className="text-sm text-[#795549]/70 mt-2 leading-relaxed">
              {report.subtitle}
            </p>
          )}
        </div>

        {/* 섹션 1: 특징 */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#DBA67A]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#DBA67A]" />
            </div>
            <h2 className="font-semibold text-[#795549]">
              {TYPE_LABELS[type]} 특징
            </h2>
          </div>
          <ul className="space-y-2">
            {report.traits.map((trait, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-[#795549]/80"
              >
                <span className="text-[#DBA67A] mt-0.5">•</span>
                <span className="leading-relaxed">{trait}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 섹션 2: 원인 분석 */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#DBA67A]/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#DBA67A]" />
            </div>
            <h2 className="font-semibold text-[#795549]">{report.cause.title}</h2>
          </div>
          <div className="space-y-3">
            {report.cause.paragraphs.map((p, idx) => (
              <p key={idx} className="text-sm text-[#795549]/80 leading-relaxed">
                {p}
              </p>
            ))}
            {report.cause.highlight && (
              <p className="text-sm font-medium text-[#DBA67A] bg-[#DBA67A]/10 px-3 py-2 rounded-lg">
                {report.cause.highlight}
              </p>
            )}
          </div>
        </Card>

        {/* 섹션 3: 추천 솔루션 */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#DBA67A]/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#DBA67A]" />
            </div>
            <h2 className="font-semibold text-[#795549]">
              {report.solution.title}
            </h2>
          </div>
          <div className="space-y-3">
            {report.solution.paragraphs.map((p, idx) => (
              <p key={idx} className="text-sm text-[#795549]/80 leading-relaxed">
                {p}
              </p>
            ))}
            {report.solution.bullets && report.solution.bullets.length > 0 && (
              <ul className="space-y-2 mt-3 pl-1">
                {report.solution.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-[#795549]/80"
                  >
                    <span className="text-[#DBA67A] mt-0.5">•</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            {report.solution.highlight && (
              <p className="text-sm font-medium text-[#DBA67A] bg-[#DBA67A]/10 px-3 py-2 rounded-lg mt-3">
                {report.solution.highlight}
              </p>
            )}
          </div>
        </Card>

        {/* 섹션 4: 솔루션 구체화 방법 TOP 4 */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#DBA67A]/20 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-[#DBA67A]" />
            </div>
            <h2 className="font-semibold text-[#795549]">{report.howto.title}</h2>
          </div>
          <div className="space-y-5">
            {report.howto.items.map((item, idx) => (
              <div key={idx} className="border-l-2 border-[#DBA67A]/30 pl-4">
                <h3 className="font-medium text-[#795549] mb-2">{item.title}</h3>
                <ul className="space-y-1.5">
                  {item.bullets.map((bullet, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-start gap-2 text-sm text-[#795549]/70"
                    >
                      <span className="text-[#DBA67A]/60 mt-0.5">-</span>
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* 하단 CTA */}
        <div className="space-y-3">
          <PrimaryPillButton
            className="w-full"
            onClick={() => navigate('/profile')}
          >
            프로필로 돌아가기
          </PrimaryPillButton>
          <button
            onClick={() => navigate('/market/test/branchingtest')}
            className="w-full py-3 rounded-full text-sm font-medium bg-white border border-[#DBA67A]/30 text-[#795549] hover:bg-[#F5F0E5] transition-all"
          >
            성향 테스트 다시 하기
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-[#795549]/50 mt-4">
          이 리포트는 당신의 ADHD 성향을 이해하고 맞춤 전략을 찾는 데 도움을 드립니다.
        </p>
      </div>
    </div>
  );
}

export default TypeReportPage;
