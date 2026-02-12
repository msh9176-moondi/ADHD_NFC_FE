IH*03*문성하
munsungha
오프라인 표시

박성재 — 오후 3:09
import { PrimaryPillButton } from "@/components/common/PillButton";
import XpBar from "@/components/common/XpBar";
import { supabase } from "@/lib/supabase";
import { useProgressStore } from "@/store/progress";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

message.txt
8KB

﻿
박성재
9diin
import { PrimaryPillButton } from "@/components/common/PillButton";
import XpBar from "@/components/common/XpBar";
import { supabase } from "@/lib/supabase";
import { useProgressStore } from "@/store/progress";
import { useEffect, useRef, useState, useCallback } from "react";
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

// StrictMode 중복 실행 및 비동기 경쟁 상태를 방지하기 위한 Ref
const isProcessingRef = useRef(false);

// 로직을 useCallback으로 감싸서 종속성 관리
const processNfcReward = useCallback(async () => {
// 이미 처리 중이라면 중복 실행 방지
if (isProcessingRef.current) return;
isProcessingRef.current = true;

    try {
      setIsLoading(true);

      // 1. 세션 확인 및 초기 동기화
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      await syncFromBackend();

      // 2. 오늘 날짜 및 데이터 조회
      const today = new Date().toISOString().split('T')[0];

      // 병렬 조회를 통해 속도 최적화 및 에러 방지 (maybeSingle 사용)
      const [historyRes, userRes] = await Promise.all([
        supabase
          .from('coin_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'earn')
          .eq('description', 'NFC 체크인 보상')
          .gte('created_at', today + 'T00:00:00')
          .lt('created_at', today + 'T23:59:59')
          .maybeSingle(), // 데이터가 없어도 에러를 던지지 않음
        supabase
          .from('users')
          .select('total_tag_count, coin_balance, xp')
          .eq('id', user.id)
          .single()
      ]);

      const alreadyCheckedIn = !!historyRes.data;
      const userData = userRes.data;
      const currentTagCount = userData?.total_tag_count || 0;
      const currentCoinBalance = userData?.coin_balance || 0;
      const currentXp = userData?.xp || 0;

      // 3. 조회수 증가 (항상 실행)
      const newTagCount = currentTagCount + 1;
      setTotalTagCount(newTagCount);
      await supabase
        .from('users')
        .update({ total_tag_count: newTagCount })
        .eq('id', user.id);

      // 4. 보상 지급 판단 (하루 1회)
      if (!alreadyCheckedIn) {
        const newCoinBalance = currentCoinBalance + 15;
        const newXp = currentXp + 10;

        await supabase
          .from('users')
          .update({ coin_balance: newCoinBalance, xp: newXp })
          .eq('id', user.id);

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
        // 보상 지급 후 최종 UI 상태 동기화
        await syncFromBackend();
      } else {
        setCoinAwarded(false);
        setReceivedToday(true);
      }
    } catch (error) {
      console.error("NFC 보상 처리 실패:", error);
      // 에러 시 다음 렌더링에서 재시도 가능하도록 플래그 리셋
      isProcessingRef.current = false;
    } finally {
      setIsLoading(false);
    }

}, [syncFromBackend]);

useEffect(() => {
processNfcReward();
}, [processNfcReward]);

// 기존 HTML/CSS 스타일 그대로 유지
const cardClass = "bg-white rounded-xl shadow-sm";

return (

<div className="flex-1 flex flex-col justify-center px-4 py-6">
<div className="flex flex-col gap-6">
<div
className={`flex flex-col items-center w-full max-w-md mx-auto gap-4 px-6 py-6`} >
{isLoading ? (
<div className="text-[#795549]">로딩 중...</div>
) : coinAwarded ? (
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
message.txt
8KB
