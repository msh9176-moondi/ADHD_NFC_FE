import { ProductCard, PageHeader } from "@/components/common";
import { PrimaryPillButton } from "@/components/common/PillButton";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useProgressStore } from "@/store/progress";
import { useTraitsStore, type TraitKey } from "@/store/traits";
import { useProductsStore } from "@/store/products";
import { getTopTrait, TRAIT_DESCRIPTIONS } from "@/utils/traits";
import { supabase } from "@/lib/supabase";

// 물뿌리개 가격 상수
const WATERING_CAN_PRICE = 15;

type Recommended = {
  title: string;
  desc: string;
  imageSrc: string;
  // 필요하면 price, link 등을 추가
};

const RECOMMENDED_BY_TRAIT: Record<TraitKey, Recommended> = {
  attention: {
    title: "타이머",
    desc: "시간 감각을 잡아줘요",
    imageSrc: "/assets/items/timer.png",
  },
  impulsive: {
    title: "밸런스 보드",
    desc: "몸을 쓰면 충동이 가라앉아요",
    imageSrc: "/assets/items/balance-board.png", // 없으면 아이콘/다른 이미지로 교체
  },
  complex: {
    title: "ADHD 플래너",
    desc: "컨디션 기복을 구조로 받쳐줘요",
    imageSrc: "/assets/items/planner.png",
  },
  emotional: {
    title: "스트레스 볼",
    desc: "감정 폭발 전에 손으로 진정",
    imageSrc: "/assets/items/stress-ball.png",
  },
  motivation: {
    title: "알람 약통",
    desc: "미루는 날에도 “시작”을 걸어줘요",
    imageSrc: "/assets/items/pill.png",
  },
  environment: {
    title: "집중 환경 키트",
    desc: "환경 세팅이 실행을 당겨줘요",
    imageSrc: "/assets/items/environment.png",
  },
};

const chartConfig = {
  score: { label: "Score", color: "var(--chart-1)" },
} satisfies ChartConfig;

function QuestionHexagon() {
  // 테스트 전 "물음표 육각형"
  return (
    <div className="relative w-full h-full">
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
  const {
    recommendations,
    topTrait: apiTopTrait,
    fetchProducts,
    fetchRecommendations,
  } = useProductsStore();

  // 물뿌리개 구매 상태
  const [isWateringLoading, setIsWateringLoading] = useState(false);
  const [wateringMessage, setWateringMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 물뿌리개 구매 핸들러
  const handleWateringCanPurchase = async () => {
    if (coins < WATERING_CAN_PRICE) {
      setWateringMessage({ type: "error", text: "코인이 부족해요!" });
      setTimeout(() => setWateringMessage(null), 3000);
      return;
    }

    setIsWateringLoading(true);
    setWateringMessage(null);

    try {
      // 현재 로그인된 유저 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWateringMessage({ type: "error", text: "로그인이 필요해요" });
        return;
      }

      // 유저 정보 조회
      const { data: userData } = await supabase
        .from('users')
        .select('coin_balance, xp')
        .eq('id', user.id)
        .single();

      const currentCoinBalance = userData?.coin_balance || 0;
      const currentXp = userData?.xp || 0;

      if (currentCoinBalance < WATERING_CAN_PRICE) {
        setWateringMessage({ type: "error", text: "코인이 부족해요!" });
        return;
      }

      // 코인 -15, XP +50
      const newCoinBalance = currentCoinBalance - WATERING_CAN_PRICE;
      const newXp = currentXp + 50;

      await supabase
        .from('users')
        .update({ coin_balance: newCoinBalance, xp: newXp })
        .eq('id', user.id);

      // 코인 히스토리 기록
      await supabase
        .from('coin_history')
        .insert({
          user_id: user.id,
          type: 'use',
          amount: -WATERING_CAN_PRICE,
          balance_after: newCoinBalance,
          description: '물뿌리개 구매',
        });

      await syncFromBackend(); // 코인 & XP 갱신
      setWateringMessage({
        type: "success",
        text: "🌱 물뿌리개로 나무에 물을 줬어요! XP +50",
      });
    } catch (error: any) {
      console.error("물뿌리개 구매 실패:", error);
      setWateringMessage({ type: "error", text: "구매에 실패했어요" });
    } finally {
      setIsWateringLoading(false);
      setTimeout(() => setWateringMessage(null), 3000);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchTraits();
    fetchProducts();
    fetchRecommendations();
  }, [fetchTraits, fetchProducts, fetchRecommendations]);

  const taken = hasAnyScore();
  const topTrait = useMemo<TraitKey | null>(() => {
    // API에서 받은 topTrait 우선, 없으면 로컬 계산
    if (apiTopTrait) return apiTopTrait;
    if (!taken) return null;
    return getTopTrait(scores);
  }, [apiTopTrait, taken, scores]);

  const chartData = useMemo(() => {
    // Recharts RadarChart는 data 배열 + dataKey 사용
    return [
      { axis: "집중", score: scores?.attention ?? 0 },
      { axis: "충동", score: scores?.impulsive ?? 0 },
      { axis: "복합", score: scores?.complex ?? 0 },
      { axis: "감정", score: scores?.emotional ?? 0 },
      { axis: "동기", score: scores?.motivation ?? 0 },
      { axis: "환경", score: scores?.environment ?? 0 },
    ];
  }, [scores]);

  const topTraitLines = useMemo(() => {
    if (!taken || !topTrait)
      return [
        "당신의 패턴을 요약해서",
        '"지금 필요한 도구"를 추천해요.',
      ] as const;

    return TRAIT_DESCRIPTIONS[topTrait];
  }, [taken, topTrait]);

  // 추천 상품 (API 우선, 없으면 성향 기반 fallback)
  const recommendedItem = useMemo(() => {
    if (recommendations[0]) return recommendations[0];
    if (topTrait && RECOMMENDED_BY_TRAIT[topTrait]) {
      const fallback = RECOMMENDED_BY_TRAIT[topTrait];
      return {
        id: `fallback-${topTrait}`,
        name: fallback.title,
        description: fallback.desc,
        imageUrl: fallback.imageSrc,
        price: 0,
        category: "recommendation",
        recommendedTrait: topTrait,
        isAvailable: true,
        isComingSoon: false,
      };
    }
    return null;
  }, [recommendations, topTrait]);

  return (
    <div className="flex flex-col items-center justify-center w-full mt-6">
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
            "w-full mt-2 px-4 py-3 rounded-xl text-center text-sm font-medium transition-all",
            wateringMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700",
          ].join(" ")}
        >
          {wateringMessage.text}
        </div>
      )}

      {/* 카드 박스 */}
      <section className="w-full mt-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <ProductCard
            title="체험단 전용 특전"
            imageSrc="/assets/items/gift.png"
            desc={"체험단 얼리버드 구매 특전: 추가 구성 증정"}
            price={105}
            onBuy={() => navigate("/market/order/cartpage")}
          />

          <ProductCard
            title="물뿌리개"
            imageSrc="/assets/items/watering-can.png"
            desc={"나무 성장 XP를\n더 빨리 올려줘요"}
            price={WATERING_CAN_PRICE}
            onBuy={handleWateringCanPurchase}
            isLoading={isWateringLoading}
          />

          <ProductCard
            title="전문가 상담권"
            imageSrc="/assets/items/ticket.png"
            desc={"(준비중) 전문가 상담 서비스"}
            isComingSoon
          />

          <ProductCard
            title="커피 기프티콘"
            imageSrc="/assets/items/coffee.png"
            desc={"(준비중) 나에게 주는 음료 한 잔"}
            isComingSoon
          />

          <ProductCard
            title="타이머"
            imageSrc="/assets/items/timer.png"
            desc={"(준비중) 집중력 향상을 위한\n시간 관리 도구"}
            isComingSoon
          />

          <ProductCard
            title="알람 약통"
            imageSrc="/assets/items/pill.png"
            desc={"(준비중) 약 복용을\n절대 놓치지 않게"}
            isComingSoon
          />

          {/* 5개 이상 추가되면 여기만 스크롤 */}
        </div>
      </section>

      {/* 성향 테스트 & 추천 아이템 */}
      <section className="w-full mt-6 space-y-4">
        {/* ADHD 성향 카드 */}
        <div className="w-full">
          <h3 className="text-[14px] font-semibold text-[#795549] pb-2">
            당신의 ADHD성향
          </h3>
          <Card className="w-full py-5 px-4">
            <div className="flex flex-row items-center gap-2">
              {/* 차트 영역 (왼쪽) */}
              <div className="w-[120px] h-[120px] shrink-0 flex items-center justify-center">
                {!taken ? (
                  <div className="w-[115px] h-[115px]">
                    <QuestionHexagon />
                  </div>
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="!w-[120px] !h-[120px] !min-h-0"
                  >
                    <RadarChart
                      data={chartData}
                      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
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
                              dy={2}
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

              {/* 설명 + 버튼 영역 (오른쪽) */}
              <div className="flex-1 min-w-0 flex flex-col items-end">
                <div
                  className={[
                    "text-[12px] leading-relaxed text-[#795549]/80 mb-3 text-right",
                    !taken ? "blur-[4px] select-none" : "",
                  ].join(" ")}
                >
                  {topTraitLines.map((line, i) => (
                    <p key={i} className="break-keep">
                      {line}
                    </p>
                  ))}
                </div>

                <PrimaryPillButton
                  onClick={() => navigate("/market/test/branchingtest")}
                  className="h-9 px-4 text-[12px]"
                >
                  성향 테스트 하기 →
                </PrimaryPillButton>
              </div>
            </div>
          </Card>
        </div>

        {/* 추천 아이템 카드 */}
        <div className="w-full">
          <h3 className="text-[14px] font-semibold text-[#795549] pb-2">
            추천 아이템
          </h3>

          <Card className="w-full p-4">
            {!taken || !recommendedItem ? (
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🤔</div>
                  <p className="text-[12px] text-[#795549]/60">
                    성향 테스트 후 맞춤 아이템을 추천해드려요
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#F5F0E5] rounded-xl flex items-center justify-center shrink-0">
                  <img
                    src={recommendedItem.imageUrl}
                    alt={recommendedItem.name}
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[#795549] mb-1">
                    {recommendedItem.name}
                  </div>
                  <div className="text-[11px] text-[#795549]/70 leading-snug mb-2">
                    {recommendedItem.description}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/market/order/cartpage")}
                    className="text-[11px] font-medium text-white bg-[#DBA67A] px-4 py-1.5 rounded-full hover:bg-[#c99568] transition-colors"
                  >
                    보러가기
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
      {/* CTA */}
      <section className="w-full mt-7">
        <PrimaryPillButton
          className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
          onClick={() => navigate("/growth")}
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
