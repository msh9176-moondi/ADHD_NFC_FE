import { ProductCard, PageHeader } from '@/components/common';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useProgressStore } from '@/store/progress';
import { useTraitsStore, type TraitKey } from '@/store/traits';
import { getTopTrait, TRAIT_DESCRIPTIONS } from '@/utils/traits';
import { api } from '@/lib/api';

type Recommended = {
  title: string;
  desc: string;
  imageSrc: string;
  // 필요하면 price, link 등을 추가
};

const RECOMMENDED_BY_TRAIT: Record<TraitKey, Recommended> = {
  attention: {
    title: '타이머',
    desc: '시간 감각을 잡아줘요',
    imageSrc: '/assets/items/timer.png',
  },
  impulsive: {
    title: '밸런스 보드',
    desc: '몸을 쓰면 충동이 가라앉아요',
    imageSrc: '/assets/items/balance-board.png', // 없으면 아이콘/다른 이미지로 교체
  },
  complex: {
    title: 'ADHD 플래너',
    desc: '컨디션 기복을 구조로 받쳐줘요',
    imageSrc: '/assets/items/planner.png',
  },
  emotional: {
    title: '스트레스 볼',
    desc: '감정 폭발 전에 손으로 진정',
    imageSrc: '/assets/items/stress-ball.png',
  },
  motivation: {
    title: '알람 약통',
    desc: '미루는 날에도 “시작”을 걸어줘요',
    imageSrc: '/assets/items/pill.png',
  },
  environment: {
    title: '집중 환경 키트',
    desc: '환경 세팅이 실행을 당겨줘요',
    imageSrc: '/assets/items/environment.png',
  },
};

const chartConfig = {
  score: { label: 'Score', color: 'var(--chart-1)' },
} satisfies ChartConfig;

function QuestionHexagon() {
  // 테스트 전 “물음표 육각형”
  return (
    <div className="relative w-35 h-35">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#D9A77F" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[#795549] text-5xl font-extrabold">
        ?
      </div>
    </div>
  );
}

function MarketPage() {
  const coins = useProgressStore((s) => s.coins);
  const syncFromBackend = useProgressStore((s) => s.syncFromBackend);
  const navigate = useNavigate();
  const { scores, hasAnyScore, fetchTraits } = useTraitsStore();

  // 물뿌리개 구매 상태
  const [isWateringLoading, setIsWateringLoading] = useState(false);
  const [wateringMessage, setWateringMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 물뿌리개 구매 핸들러
  const handleWateringCanPurchase = async () => {
    if (isWateringLoading) return;

    setIsWateringLoading(true);
    setWateringMessage(null);

    try {
      const response = await api.post('/growth/watering-can');
      const data = response.data;

      if (data.success) {
        setWateringMessage({
          type: 'success',
          text: `+${data.xpGained} XP 획득! 나무가 쑥쑥 자라요!`,
        });
        // 백엔드에서 최신 데이터 동기화
        await syncFromBackend();
      } else {
        setWateringMessage({
          type: 'error',
          text: data.message || '구매에 실패했습니다.',
        });
      }
    } catch (err: any) {
      setWateringMessage({
        type: 'error',
        text: err.response?.data?.message || '코인이 부족합니다.',
      });
    } finally {
      setIsWateringLoading(false);
      // 3초 후 메시지 숨기기
      setTimeout(() => setWateringMessage(null), 3000);
    }
  };

  // 페이지 로드 시 성향 점수 가져오기
  useEffect(() => {
    fetchTraits();
  }, [fetchTraits]);

  const taken = hasAnyScore();
  const topTrait = useMemo<TraitKey | null>(() => {
    if (!taken) return null;
    return getTopTrait(scores);
  }, [taken, scores]);

  const chartData = useMemo(() => {
    // Recharts RadarChart는 data 배열 + dataKey 사용
    return [
      { axis: '집중', score: scores?.attention ?? 0 },
      { axis: '충동', score: scores?.impulsive ?? 0 },
      { axis: '복합', score: scores?.complex ?? 0 },
      { axis: '감정', score: scores?.emotional ?? 0 },
      { axis: '동기', score: scores?.motivation ?? 0 },
      { axis: '환경', score: scores?.environment ?? 0 },
    ];
  }, [scores]);

  const topTraitLines = useMemo(() => {
    if (!taken || !topTrait)
      return [
        '당신의 패턴을 요약해서',
        '"지금 필요한 도구"를 추천해요.',
      ] as const;

    return TRAIT_DESCRIPTIONS[topTrait];
  }, [taken, topTrait]);

  return (
    <div className="flex flex-col items-center justify-center w-full mt-14">
      {/* 메인 타이틀 */}
      <PageHeader
        title="Dopa Market"
        subtitle="당신의 일상을 도와줄 특별한 아이템"
        coins={coins}
      />

      {/* 구매 피드백 메시지 */}
      {wateringMessage && (
        <div
          className={[
            'w-full mt-2 px-4 py-3 rounded-xl text-center text-sm font-medium transition-all',
            wateringMessage.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700',
          ].join(' ')}
        >
          {wateringMessage.text}
        </div>
      )}

      {/* 카드 박스 */}
      <section className="w-full mt-2 max-h-160 overflow-y-auto overscroll-contain pr-1 no-scrollbar">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <ProductCard
            title="체험단 전용 특전"
            imageSrc="/assets/items/gift.png"
            desc={'체험단 얼리버드 구매 특전: 추가 구성 증정'}
            price={105}
            onBuy={() => navigate('/market/order/cartpage')}
          />

          <ProductCard
            title="물뿌리개"
            imageSrc="/assets/items/watering-can.png"
            desc={'나무 성장 XP를\n더 빨리 올려줘요'}
            price={15}
            onBuy={handleWateringCanPurchase}
            isLoading={isWateringLoading}
          />

          <ProductCard
            title="전문가 상담권"
            imageSrc="/assets/items/ticket.png"
            desc={'(준비중) 전문가 상담 서비스'}
            isComingSoon
          />

          <ProductCard
            title="커피 기프티콘"
            imageSrc="/assets/items/coffee.png"
            desc={'(준비중) 나에게 주는 음료 한 잔'}
            isComingSoon
          />

          <ProductCard
            title="타이머"
            imageSrc="/assets/items/timer.png"
            desc={'(준비중) 집중력 향상을 위한\n시간 관리 도구'}
            isComingSoon
          />

          <ProductCard
            title="알람 약통"
            imageSrc="/assets/items/pill.png"
            desc={'(준비중) 약 복용을\n절대 놓치지 않게'}
            isComingSoon
          />

          {/* 5개 이상 추가되면 여기만 스크롤 */}
        </div>
      </section>

      {/* 성향 테스트 */}
      <section className="flex items-center justify-center w-full gap-4 mt-4">
        <div className="flex-1 flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#795549] pb-1">
            당신의 ADHD성향
          </h3>
          <Card className="w-full h-60 p-4">
            <div className="flex items-center justify-center gap-6">
              {/* 왼쪽: 육각형 + 버튼을 세로로 묶은 영역 */}
              <div className="flex flex-col items-center gap-3">
                {/* 육각형 영역 */}
                <div className="w-40 flex items-center justify-center">
                  {!taken ? (
                    <QuestionHexagon />
                  ) : (
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square max-h-40 w-40"
                    >
                      <RadarChart
                        data={chartData}
                        margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
                      >
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <PolarAngleAxis
                          dataKey="axis"
                          tick={(props) => {
                            const { x, y, payload, textAnchor } = props as any;
                            return (
                              <text
                                x={x}
                                y={y}
                                textAnchor={textAnchor}
                                fill="#795549"
                                fontSize={10}
                                fontWeight={600}
                                dy={3}
                              >
                                {payload.value}
                              </text>
                            );
                          }}
                        />
                        <PolarGrid />
                        <Radar
                          dataKey="score"
                          fill="#DBA67A"
                          stroke="#DBA67A"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ChartContainer>
                  )}
                </div>

                {/* 버튼 영역: 육각형 바로 아래 배치 */}
                <button
                  onClick={() => navigate('/market/test/branchingtest')}
                  className="w-full text-center"
                  type="button"
                >
                  <div className="inline-block">
                    <div className="text-[12px] font-semibold text-[#795549]">
                      나의 ADHD 성향 테스트 →
                    </div>
                    <div className="mt-0.5 h-0.5 w-full bg-[#795549]" />
                  </div>
                </button>
              </div>

              {/* 오른쪽: 설명 영역 */}
              <div className="flex-1">
                <div
                  className={[
                    'text-[12px] leading-relaxed text-[#795549]/70 space-y-2',
                    !taken ? 'blur-[6px] select-none' : '',
                  ].join(' ')}
                >
                  <div className="space-y-1">
                    {topTraitLines.map((line, i) => (
                      <p key={i} className="break-keep">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#795549] pb-1">
            추천 아이템
          </h3>

          <Card className="relative w-32 h-60 p-3">
            {!taken || !topTrait ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-4xl">🤔</div>
              </div>
            ) : (
              (() => {
                const item = RECOMMENDED_BY_TRAIT[topTrait];
                return (
                  <>
                    {/* 콘텐츠: 위쪽 정렬 + 버튼 자리 확보 */}
                    <div className="flex flex-col items-center text-center gap-2 pt-1">
                      <div className="text-[12px] font-semibold text-[#795549]">
                        {item.title}
                      </div>

                      <div className="flex flex-col items-center justify-center gap-4 mt-4">
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className="w-14 h-14 object-contain"
                        />

                        <div className="text-[10px] text-[#795549]/70 leading-snug whitespace-pre-line">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {/* 버튼: 카드 하단 고정 (여백 깔끔) */}
                    <button
                      type="button"
                      onClick={() => navigate('/market/order/cartpage')}
                      className="absolute left-3 right-3 bottom-6 text-[12px] font-semibold text-[#795549]"
                    >
                      <div className="inline-block">
                        <div>보러가기 →</div>
                        <div className="mt-0.5 h-0.5 w-full bg-[#795549]" />
                      </div>
                    </button>
                  </>
                );
              })()
            )}
          </Card>
        </div>
      </section>
      {/* CTA */}
      <section className="w-full mt-7">
        <PrimaryPillButton
          className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
          onClick={() => navigate('/growth')}
        >
          <span aria-hidden>🌳</span>
          <span>나무 보러가기 →</span>
        </PrimaryPillButton>

        <p className="text-center text-[12px] text-[#795549]/70 mt-2">
          열심히 쌓은 코인으로 자신에게 보상을 주세요.
        </p>
      </section>
    </div>
  );
}

export default MarketPage;
