import { useEffect, useMemo } from 'react';
import { PrimaryPillButton } from '@/components/common/PillButton';
import XpBar from '@/components/common/XpBar';
import { useProgressStore } from '@/store/progress';
import { useGrowthStore } from '@/store/growth';
import { useNavigate } from 'react-router-dom';

const GROWTH_STAGES = [
  {
    minLevel: 1,
    asset: '/assets/seed/seed-1.svg',
    text: '씨앗이 자라고 있어요!!',
  },
  { minLevel: 2, asset: '/assets/seed/seed-2.svg', text: '씨앗이 돋아났어요!' },
  {
    minLevel: 3,
    asset: '/assets/seed/seed-3.svg',
    text: '새싹이 자라고 있어요!!',
  },
  { minLevel: 4, asset: '/assets/seed/seed-4.svg', text: '잎이 무성해졌어요!' },
  {
    minLevel: 5,
    asset: '/assets/seed/seed-5.svg',
    text: '작은 나무가 되었어요!',
  },
  {
    minLevel: 6,
    asset: '/assets/seed/seed-6.svg',
    text: '나무가 자라고 있어요!',
  },
  {
    minLevel: 7,
    asset: '/assets/seed/seed-7.svg',
    text: '큰 나무가 되었어요!',
  },
  {
    minLevel: 8,
    asset: '/assets/seed/seed-8.svg',
    text: '나무에 열매가 맺혔어요!',
  },
] as const;

function getGrowthStage(level: number) {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (level >= GROWTH_STAGES[i].minLevel) return GROWTH_STAGES[i];
  }
  return GROWTH_STAGES[0];
}

const ROUTINES_META = [
  {
    id: 'water',
    title: '물 마시기',
    subtitle: '몸에게 주는 작은 선물',
    emoji: '💧',
  },
  {
    id: 'clean',
    title: '청소하기',
    subtitle: '마음도 함께 정돈돼요',
    emoji: '🧹',
  },
  { id: 'walk', title: '걷기', subtitle: '생각이 맑아지는 시간', emoji: '🚶' },
  {
    id: 'meditate',
    title: '명상하기',
    subtitle: '잠시 멈춤의 여유',
    emoji: '🧘',
  },
  {
    id: 'plan',
    title: '계획 세우기',
    subtitle: '내일을 위한 준비',
    emoji: '📝',
  },
] as const;

function GrowthPage() {
  const navigate = useNavigate();

  // 나무 데이터 (progress 스토어)
  const {
    level,
    xp,
    xpToNext,
    syncFromBackend,
    isLoading: treeLoading,
  } = useProgressStore();

  // 통계 데이터 (growth 스토어)
  const {
    routineRanking: apiRoutineRanking,
    totalExecutions,
    currentStreak,
    totalDays,
    isLoading: statsLoading,
    fetchAll: fetchStats,
  } = useGrowthStore();

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    syncFromBackend();
    fetchStats();
  }, [syncFromBackend, fetchStats]);

  const growth = getGrowthStage(level);
  const cardClass = 'bg-white rounded-xl shadow-sm';
  const isLoading = treeLoading || statsLoading;

  // 백엔드 루틴 랭킹을 ROUTINES_META와 매핑
  const routineRanking = useMemo(() => {
    return ROUTINES_META.map((r) => {
      const apiData = apiRoutineRanking.find((ar) => ar.routineId === r.id);
      return { ...r, count: apiData?.count ?? 0 };
    }).sort((a, b) => b.count - a.count);
  }, [apiRoutineRanking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#795549]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center mt-18">
      <div className="flex flex-col gap-10">
        {/* 성장 영역 */}
        <div
          className={`flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto w-fll`}
        >
          <div className="text-center">
            <h2 className="text-[14px] font-semibold text-[#795549] mb-1">
              나만의 성장 나무
            </h2>
            <p className="text-[12px] text-[#795549]/70">
              매일의 작은 실천이 이 나무를 키워왔어요
            </p>
          </div>

          <img src={growth.asset} alt="" />
          <p className="text-[#795549]">{growth.text}</p>
          <XpBar level={level} xp={xp} xpToNext={xpToNext} className="mt-2" />
        </div>

        {/* 나만의 루틴 랭킹 */}
        <section className="w-full max-w-md mx-auto">
          <h3 className="text-[14px] font-semibold text-[#795549] mb-3">
            나만의 루틴 랭킹
          </h3>

          <div className="space-y-2">
            {routineRanking.map((r) => (
              <div
                key={r.id}
                className="bg-[#F5F0E5] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <span className="text-[18px]" aria-hidden>
                      {r.emoji}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <div className="text-[13px] font-semibold text-[#795549]">
                      {r.title}
                    </div>
                    <div className="text-[12px] text-[#795549]/70">
                      {r.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-[12px] font-semibold text-[#795549]">
                  {r.count}회
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] text-[#795549]/70 mt-3">
            기록할수록 랭킹이 쌓이고, 나무가 더 빨리 자라요.
          </p>
        </section>

        {/* 성장 기록 */}
        <section className="w-full max-w-md mx-auto">
          <h3 className="text-[14px] font-semibold text-[#795549] mb-3">
            성장 기록
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F5F0E5] rounded-2xl p-5 text-center">
              <div className="text-[28px] mb-2" aria-hidden>
                🤎
              </div>
              <div className="text-[20px] font-bold text-[#795549]">
                {totalExecutions}
              </div>
              <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
                총 실행
              </div>
            </div>

            <div className="bg-[#F5F0E5] rounded-2xl p-5 text-center">
              <div className="text-[28px] mb-2" aria-hidden>
                🔥
              </div>
              <div className="text-[20px] font-bold text-[#795549]">
                {currentStreak}
              </div>
              <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
                연속 실행
              </div>
            </div>

            <div className="bg-[#F5F0E5] rounded-2xl p-5 text-center">
              <div className="text-[28px] mb-2" aria-hidden>
                📅
              </div>
              <div className="text-[20px] font-bold text-[#795549]">
                {totalDays}
              </div>
              <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
                기록 일수
              </div>
            </div>

            <div className="bg-[#F5F0E5] rounded-2xl p-5 text-center">
              <div className="text-[28px] mb-2" aria-hidden>
                🌳
              </div>
              <div className="text-[20px] font-bold text-[#795549]">
                {level}
              </div>
              <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
                나무 레벨
              </div>
            </div>
          </div>
        </section>

        {/* 구분선 + 문구 섹션 */}
        <section className="w-full max-w-md mx-auto">
          <div className="border-t border-[#DBA67A]/60 pt-6 text-center">
            <h4 className="text-[14px] font-semibold text-[#795549]">
              성장하는 모습이 아름다워요
            </h4>
            <p className="text-[12px] text-[#795549]/70 mt-2">
              매일 매일 조금씩, 당신만의 속도로 자라고 있어요
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full mt-2 max-w-md mx-auto">
          <PrimaryPillButton
            className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
            onClick={() => navigate('/profile')}
          >
            <span aria-hidden>✏️</span>
            <span>프로필 →</span>
          </PrimaryPillButton>

          <p className="text-center text-[12px] text-[#795549]/70 mt-2">
            오늘 하루 어땠나요? 알려줄래요?
          </p>
        </section>
      </div>
    </div>
  );
}

export default GrowthPage;
