import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { cn } from '@/lib/utils';

// Types
interface ReportSummary {
  emotion_execution: string;
  recovery: string;
  language_shift: string;
  retention: string;
  next_strategy: string;
}

interface ReportDetailSection {
  text: string;
  actions: string[];
}

interface ReportDetail {
  emotion_execution: ReportDetailSection;
  recovery: ReportDetailSection;
  language_shift: ReportDetailSection;
  retention: ReportDetailSection;
  next_strategy: ReportDetailSection;
}

interface MoodStat {
  mood: string;
  count: number;
  percentage: number;
}

interface ReportStats {
  recordDays: number;
  avgCompletionRate: number;
  topMoods: MoodStat[];
  moodDistribution: Record<string, number>;
  recoveryRate: number;
  languageShift: {
    selfBlame: { first: number; second: number };
    acceptance: { first: number; second: number };
  };
}

interface MonthlyReportResponse {
  id: string;
  yearMonth: string;
  summary: ReportSummary | null;
  detail: ReportDetail | null;
  stats: ReportStats | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
  regenerateRemaining: number;
  isDataInsufficient: boolean;
}

// 감정 이모지 매핑
const MOOD_EMOJI: Record<string, string> = {
  excited: '🤩',
  calm: '😊',
  sleepy: '😴',
  tired: '😣',
  angry: '😡',
  anxiety: '😰',
  joy: '😄',
  neutral: '😐',
};

// 감정 한글 매핑
const MOOD_LABEL: Record<string, string> = {
  excited: '기쁨',
  calm: '평온',
  sleepy: '피곤',
  tired: '무기력',
  angry: '짜증',
  anxiety: '불안',
  joy: '기쁨',
  neutral: '보통',
};

// 섹션 타이틀 매핑
const SECTION_TITLES: Record<string, { title: string; emoji: string }> = {
  emotion_execution: { title: '감정과 실행의 연결', emoji: '🎯' },
  recovery: { title: '회복 패턴', emoji: '🔄' },
  language_shift: { title: '언어 변화', emoji: '💬' },
  retention: { title: '이번 달의 유지력', emoji: '📊' },
  next_strategy: { title: '다음 달의 전략', emoji: '🚀' },
};

function AiAnalysisPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState<MonthlyReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'detail'>('summary');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 현재 연월 계산
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // 리포트 조회
  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const yearMonth = getCurrentYearMonth();
      const response = await api.get<MonthlyReportResponse>(
        `/reports/monthly?yearMonth=${yearMonth}`,
      );
      setReport(response.data);
    } catch (err: any) {
      console.error('리포트 조회 실패:', err);
      setError(err.response?.data?.message || '리포트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 리포트 재생성
  const handleRegenerate = async () => {
    if (!window.confirm('리포트를 새로 생성하시겠습니까?\n(월 3회까지 가능합니다)')) {
      return;
    }

    setIsRegenerating(true);
    try {
      const yearMonth = getCurrentYearMonth();
      const response = await api.post<MonthlyReportResponse>(
        `/reports/monthly/regenerate?yearMonth=${yearMonth}`,
      );
      setReport(response.data);
    } catch (err: any) {
      console.error('리포트 재생성 실패:', err);
      alert(err.response?.data?.message || '리포트 재생성에 실패했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#EFDDC3] rounded w-3/4 mx-auto" />
            <div className="h-24 bg-[#EFDDC3] rounded" />
            <div className="h-24 bg-[#EFDDC3] rounded" />
            <div className="h-24 bg-[#EFDDC3] rounded" />
          </div>
          <p className="text-center text-[#795549]/70 mt-4">
            AI가 당신의 패턴을 분석하고 있어요...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">😢</div>
          <h2 className="text-lg font-semibold text-[#795549] mb-2">
            리포트를 불러올 수 없어요
          </h2>
          <p className="text-sm text-[#795549]/70 mb-4">{error}</p>
          <PrimaryPillButton onClick={fetchReport}>다시 시도</PrimaryPillButton>
        </div>
      </div>
    );
  }

  // 데이터 없음 상태
  if (!report || !report.stats || report.stats.recordDays === 0) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-lg font-semibold text-[#795549] mb-2">
            이번 달 기록이 아직 없어요
          </h2>
          <p className="text-sm text-[#795549]/70 mb-4">
            기록을 남기면 AI가 당신의 패턴을 분석해드릴게요.
          </p>
          <PrimaryPillButton onClick={() => navigate('/report')}>
            기록하러 가기
          </PrimaryPillButton>
        </div>
      </div>
    );
  }

  const { summary, detail, stats } = report;

  return (
    <div className="w-full px-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="pt-6 pb-4 text-center">
          <h1 className="text-lg font-bold text-[#795549]">
            {report.yearMonth.replace('-', '년 ')}월 ADHD 패턴 리포트
          </h1>
          {report.isDataInsufficient && (
            <p className="text-xs text-[#DBA67A] mt-1">
              * 기록이 적어 조심스러운 추정이에요
            </p>
          )}
        </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card className="p-3 text-center bg-white rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-[#795549]">{stats.recordDays}</div>
            <div className="text-xs text-[#795549]/70">기록 일수</div>
          </Card>
          <Card className="p-3 text-center bg-white rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-[#795549]">{stats.avgCompletionRate}%</div>
            <div className="text-xs text-[#795549]/70">평균 이행률</div>
          </Card>
          <Card className="p-3 text-center bg-white rounded-xl shadow-sm">
            <div className="text-lg">
              {stats.topMoods.slice(0, 2).map((m) => (
                <span key={m.mood} title={MOOD_LABEL[m.mood] || m.mood}>
                  {MOOD_EMOJI[m.mood] || '😐'}
                </span>
              ))}
            </div>
            <div className="text-xs text-[#795549]/70">주요 감정</div>
          </Card>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={cn(
              'flex-1 py-2 rounded-full text-sm font-medium transition-all',
              activeTab === 'summary'
                ? 'bg-[#795549] text-white'
                : 'bg-[#EFDDC3] text-[#795549]',
            )}
          >
            요약
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={cn(
              'flex-1 py-2 rounded-full text-sm font-medium transition-all',
              activeTab === 'detail'
                ? 'bg-[#795549] text-white'
                : 'bg-[#EFDDC3] text-[#795549]',
            )}
          >
            상세
          </button>
        </div>

        {/* 섹션들 */}
        <div className="space-y-4">
          {Object.entries(SECTION_TITLES).map(([key, { title, emoji }]) => {
            const sectionKey = key as keyof ReportSummary;

            if (activeTab === 'summary' && summary) {
              return (
                <Card key={key} className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="font-semibold text-[#795549]">{title}</h3>
                  </div>
                  <p className="text-sm text-[#795549]/80 leading-relaxed">
                    {summary[sectionKey]}
                  </p>
                </Card>
              );
            }

            if (activeTab === 'detail' && detail) {
              const section = detail[sectionKey];
              return (
                <Card key={key} className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="font-semibold text-[#795549]">{title}</h3>
                  </div>
                  <p className="text-sm text-[#795549]/80 leading-relaxed mb-3">
                    {section.text}
                  </p>
                  {section.actions && section.actions.length > 0 && (
                    <div className="border-t border-[#EFDDC3] pt-3">
                      <p className="text-xs font-medium text-[#DBA67A] mb-2">추천 액션</p>
                      <ul className="space-y-1">
                        {section.actions.map((action, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-[#795549]/70 flex items-start gap-2"
                          >
                            <span className="text-[#DBA67A]">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              );
            }

            return null;
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 space-y-3">
          <PrimaryPillButton
            className="w-full"
            onClick={() => navigate('/profile')}
          >
            완료 →
          </PrimaryPillButton>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || report.regenerateRemaining <= 0}
            className={cn(
              'w-full py-3 rounded-full text-sm font-medium transition-all',
              'bg-white border border-[#DBA67A]/30 text-[#795549]',
              'hover:bg-[#F5F0E5]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isRegenerating ? (
              '재생성 중...'
            ) : (
              <>재생성 (남은 횟수: {report.regenerateRemaining}회)</>
            )}
          </button>
        </div>

        {/* 생성 정보 */}
        <p className="text-center text-xs text-[#795549]/50 mt-4">
          {report.model && `AI: ${report.model} | `}
          마지막 업데이트: {new Date(report.updatedAt).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  );
}

export default AiAnalysisPage;
