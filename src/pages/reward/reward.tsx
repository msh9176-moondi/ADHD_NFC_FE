import { PrimaryPillButton } from "@/components/common/PillButton";
import XpBar from "@/components/common/XpBar";
import { supabase } from "@/lib/supabase";
import { useProgressStore } from "@/store/progress";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGrowthStage } from "@/utils/traits";

function RewardPage() {
  const { level, xp, xpToNext, syncFromBackend } = useProgressStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const growth = getGrowthStage(level);

  const [receivedToday, setReceivedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTagCount, setTotalTagCount] = useState(0);
  const [coinAwarded, setCoinAwarded] = useState(false);
  const isProcessingRef = useRef(false);

  // URL에서 cardUid 파라미터 확인 (NFC 태그에서 전달)
  const cardUid = searchParams.get("cardUid");

  useEffect(() => {
    // StrictMode에서 중복 실행 방지
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const processNfcReward = async () => {
      // 먼저 백엔드에서 현재 데이터 동기화
      await syncFromBackend();

      try {
        // 현재 로그인된 유저 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // 오늘 날짜 (한국 시간 기준)
        const today = new Date().toISOString().split('T')[0];

        // 오늘 이미 코인을 받았는지 확인 (coin_history에서 확인)
        const { data: todayCheckin } = await supabase
          .from('coin_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'earn')
          .eq('description', 'NFC 체크인 보상')
          .gte('created_at', today + 'T00:00:00')
          .lt('created_at', today + 'T23:59:59')
          .single();

        const alreadyCheckedIn = !!todayCheckin;

        // 유저 정보 조회
        const { data: userData } = await supabase
          .from('users')
          .select('total_tag_count, coin_balance, xp')
          .eq('id', user.id)
          .single();

        const currentTagCount = userData?.total_tag_count || 0;
        const currentCoinBalance = userData?.coin_balance || 0;
        const currentXp = userData?.xp || 0;

        // 조회수 +1 (항상)
        const newTagCount = currentTagCount + 1;
        await supabase
          .from('users')
          .update({ total_tag_count: newTagCount })
          .eq('id', user.id);

        setTotalTagCount(newTagCount);

        if (!alreadyCheckedIn) {
          // 코인 +15, XP +10 지급 (하루 1회만)
          const newCoinBalance = currentCoinBalance + 15;
          const newXp = currentXp + 10;

          await supabase
            .from('users')
            .update({ coin_balance: newCoinBalance, xp: newXp })
            .eq('id', user.id);

          // 코인 히스토리 기록
          await supabase
            .from('coin_history')
            .insert({
              user_id: user.id,
              type: 'earn',
              amount: 15,
              balance_after: newCoinBalance,
              description: 'NFC 체크인 보상',
            });

          setCoinAwarded(true);
          setReceivedToday(true);
          await syncFromBackend();
        } else {
          setCoinAwarded(false);
          setReceivedToday(true);
        }
      } catch (error: any) {
        console.error("NFC 보상 처리 실패:", error);
      }
      setIsLoading(false);
    };

    processNfcReward();
  }, [cardUid, syncFromBackend]);

  // report 카드 효과 스타일
  const cardClass = "bg-white rounded-xl shadow-sm";

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-6">
      <div className="flex flex-col gap-6">
        <div
          className={`flex flex-col items-center w-full max-w-md mx-auto gap-4 px-6 py-6`}
        >
          {isLoading ? (
            <div className="text-[#795549]">로딩 중...</div>
          ) : coinAwarded ? (
            // NFC 태그로 코인 획득!
            <>
              <div className="text-2xl text-[#795549] font-bold animate-bounce">
                코인+15 획득!
              </div>
              <div className="animate-[spin_2s_ease-in-out_1]">
                <img src="/assets/coin.svg" alt="coin" />
              </div>
              <div className="w-full text-center mt-0 text-[#795549]">
                당신의 한 작은 걸음이, 내일의 큰 변화가 됩니다.
              </div>
              <div className="text-sm text-[#795549]/70 mt-2">
                누적 조회수: {totalTagCount}회
              </div>
            </>
          ) : receivedToday ? (
            // 이미 오늘 코인 받음 → 조회수만 증가
            <>
              <div className="text-2xl text-[#795549] font-bold">
                조회수 +1!
              </div>
              <div className="opacity-70">
                <img src="/assets/coin.svg" alt="coin" />
              </div>
              <div className="text-lg text-[#795549] font-semibold">
                누적 조회수: {totalTagCount}회
              </div>
              <div className="w-full text-center mt-0 text-[#795549]/70 text-sm">
                코인은 하루 1회만 지급됩니다
              </div>
            </>
          ) : (
            // 아직 체크인 안함
            <>
              <div className="text-2xl text-[#795549] font-bold animate-bounce">
                오늘의 보상
              </div>
              <div className="opacity-70">
                <img src="/assets/coin.svg" alt="coin" />
              </div>
              <div className="w-full text-center mt-0 text-[#795549]">
                NFC 태그를 찍어 코인을 받으세요!
              </div>
              {totalTagCount > 0 && (
                <div className="text-sm text-[#795549]/70 mt-2">
                  누적 조회수: {totalTagCount}회
                </div>
              )}
            </>
          )}
        </div>

        {/* 2) 성장 영역: 카드로 감싸기 */}
        <div
          className={`flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto py-6`}
        >
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src={growth.asset}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <p className="text-[#795549]">{growth.text}</p>
          <div className={`w-full ${cardClass} p-4`}>
            <XpBar level={level} xp={xp} xpToNext={xpToNext} />
          </div>
        </div>

        {/* CTA */}
        <section className="w-full">
          <PrimaryPillButton
            className="w-full text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => navigate("/report")}
          >
            <span aria-hidden>✏️</span>
            <span>기록하러 가기 →</span>
          </PrimaryPillButton>

          <p className="text-center text-[12px] text-[#795549]/70 mt-2">
            오늘 하루 어땠나요? 알려줄래요?
          </p>
        </section>
      </div>
    </div>
  );
}

export default RewardPage;
