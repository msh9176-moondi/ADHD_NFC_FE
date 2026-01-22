import { ProductCard } from '@/components/common';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { hasAnyTraitScore, readTraitScores } from '@/utils/traitScore';
const chartConfig = {
  score: { label: 'Score', color: 'var(--chart-1)' },
} satisfies ChartConfig;

function QuestionHexagon() {
  // 테스트 전 “물음표 육각형”
  return (
    <div className="relative w-[140px] h-[140px]">
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
  const navigate = useNavigate();

  const taken = useMemo(() => hasAnyTraitScore(), []);
  const scores = useMemo(() => readTraitScores(), []);

  const chartData = useMemo(() => {
    // Recharts RadarChart는 data 배열 + dataKey 사용
    return [
      { axis: '집중', score: scores.attention ?? 0 },
      { axis: '충동', score: scores.impulsive ?? 0 },
      { axis: '복합', score: scores.complex ?? 0 },
      { axis: '감정', score: scores.emotional ?? 0 },
      { axis: '동기', score: scores.motivation ?? 0 },
      { axis: '환경', score: scores.environment ?? 0 },
    ];
  }, [scores]);
  type TraitKey =
    | 'attention'
    | 'impulsive'
    | 'complex'
    | 'emotional'
    | 'motivation'
    | 'environment';

  const TRAIT_DESC: Record<TraitKey, [string, string]> = {
    attention: ['머리는 준비됐는데,', '시작 버튼이 안 눌리는 타입이에요.'],
    impulsive: [
      '반응이 먼저 나와요.',
      '흥분하면 속도 조절이 어려울 수 있어요.',
    ],
    complex: ['날마다 컨디션이 달라요.', '잘될 때,안될 때 기복이 커요.'],
    emotional: ['작은 자극에도 흔들려요.', '회복까지 시간이 걸릴 수 있어요.'],
    motivation: [
      '중요한 걸 알아도 시동이 늦어요.',
      '외부 압박이 트리거가 돼요.',
    ],
    environment: [
      '환경에 따라 성능이 바뀌어요.',
      '집에서는 특히 막힐 수 있어요.',
    ],
  };

  const topTraitLines = useMemo(() => {
    if (!taken)
      return [
        '당신의 패턴을 요약해서',
        '“지금 필요한 도구”를 추천해요.',
      ] as const;

    const entries: Array<[TraitKey, number]> = [
      ['attention', scores.attention ?? 0],
      ['impulsive', scores.impulsive ?? 0],
      ['complex', scores.complex ?? 0],
      ['emotional', scores.emotional ?? 0],
      ['motivation', scores.motivation ?? 0],
      ['environment', scores.environment ?? 0],
    ];

    const max = Math.max(...entries.map(([, v]) => v));
    const top = entries.find(([, v]) => v === max)?.[0];

    if (!top || max <= 0)
      return [
        '테스트 결과를 기반으로',
        '“지금 필요한 도구”를 추천해요.',
      ] as const;

    return TRAIT_DESC[top];
  }, [taken, scores]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* 메인 타이틀 */}
      <section className="flex flex-col items-center justify-center w-full">
        <div className="text-5xl text-[#795549] font-extrabold">
          Dopa Market
        </div>
        <div className="text-center text-[12px] text-[#795549] mt-3">
          당신의 일상을 도와줄 특별한 아이템
        </div>
      </section>
      {/* 카드 박스 */}
      <section className="w-full mt-2 max-h-[800px] overflow-y-auto overscroll-contain pr-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <ProductCard
            title="타이머"
            imageSrc="/assets/items/timer.png"
            desc={'집중력 향상을 위한\n시간 관리 도구'}
            onBuy={() => navigate('/market/order/cartpage')}
          />
          <ProductCard
            title="물뿌리개"
            imageSrc="/assets/items/watering-can.png"
            desc={'나무 성장 XP를\n더 빨리 올려줘요'}
            onBuy={() => navigate('/market/order/cartpage')}
          />
          <ProductCard
            title="알람 약통"
            imageSrc="/assets/items/pill.png"
            desc={'약 복용을\n절대 놓치지 않게'}
            onBuy={() => navigate('/market/order/cartpage')}
          />
          <ProductCard
            title="스트레스볼"
            imageSrc="/assets/items/stress-ball.png"
            desc={'손으로 눌러서\n긴장 완화하기'}
            onBuy={() => navigate('/market/order/cartpage')}
          />
          {/* 5개 이상 추가되면 여기만 스크롤 */}
        </div>
      </section>

      {/* 성향 테스트 */}
      <section className="flex items-center justify-center w-full gap-4 mt-4">
        <div className="flex-1 flex flex-col">
          <h3 className="text-[14px] font-semibold text-[#795549]">
            당신의 ADHD성향
          </h3>

          <Card className="w-full h-50 p-4">
            <button
              onClick={() => navigate('/market/test/branchingtest')}
              className="w-full text-left -mt-2"
              type="button"
            >
              <div className="inline-block">
                <div className="text-[12px] font-semibold text-[#795549]">
                  나의 ADHD 성향 테스트하기
                </div>
                <div className="mt-0.5 h-[2px] w-full bg-[#795549]" />
              </div>
            </button>

            <div className="flex items-center justify-center -mt-4 gap-4">
              {/* 왼쪽: 육각형 영역 */}
              <div className="w-[160px] flex items-center justify-center">
                {!taken ? (
                  <QuestionHexagon />
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[160px] w-[160px]"
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
                              fontSize={10} // ✅ 여기서 글자 크기
                              fontWeight={600}
                              dy={3} // ✅ 세로 위치 미세조정(필요하면 2~6 사이로)
                            >
                              {payload.value}
                            </text>
                          );
                        }}
                      />
                      <PolarGrid />
                      <Radar
                        dataKey="score"
                        fill="var(--color-score)"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ChartContainer>
                )}
              </div>

              {/* 오른쪽: 설명 영역 */}
              <div>
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

        <div className="flex flex-col ">
          <h3 className="text-[14px] font-semibold text-[#795549]">
            추천 아이템
          </h3>
          <Card className="w-32 h-50 flex items-center justify-center">
            {/* 테스트 전엔 🤔, 테스트 후엔 추후 추천 로직으로 교체 */}
            <div className="text-4xl">{taken ? '🎁' : '🤔'}</div>
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
