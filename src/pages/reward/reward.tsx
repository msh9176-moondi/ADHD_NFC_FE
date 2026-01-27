import { PrimaryPillButton } from "@/components/common/PillButton";
import XpBar from "@/components/common/XpBar";
import { api } from "@/lib/api";
import { useProgressStore } from "@/store/progress";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GROWTH_STAGES = [
  {
    minLevel: 1,
    asset: "/assets/seed/seed-1.svg",
    text: "씨앗이 자라고 있어요!!",
  },
  { minLevel: 2, asset: "/assets/seed/seed-2.svg", text: "씨앗이 돋아났어요!" },
  {
    minLevel: 3,
    asset: "/assets/seed/seed-3.svg",
    text: "새싹이 자라고 있어요!!",
  },
  { minLevel: 4, asset: "/assets/seed/seed-4.svg", text: "잎이 무성해졌어요!" },
  {
    minLevel: 5,
    asset: "/assets/seed/seed-5.svg",
    text: "작은 나무가 되었어요!",
  },
  {
    minLevel: 6,
    asset: "/assets/seed/seed-6.svg",
    text: "나무가 자라고 있어요!",
  },
  {
    minLevel: 7,
    asset: "/assets/seed/seed-7.svg",
    text: "큰 나무가 되었어요!",
  },
  {
    minLevel: 8,
    asset: "/assets/seed/seed-8.svg",
    text: "나무에 열매가 맺혔어요!",
  },
] as const;

function getGrowthStage(level: number) {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (level >= GROWTH_STAGES[i].minLevel) return GROWTH_STAGES[i];
  }
  return GROWTH_STAGES[0];
}

function RewardPage() {
  const { level, xp, xpToNext, syncFromBackend } = useProgressStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const growth = getGrowthStage(level);

  const [receivedToday, setReceivedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URL에서 cardUid 파라미터 확인 (NFC 태그에서 전달)
  const cardUid = searchParams.get("cardUid");

  useEffect(() => {
    const processNfcReward = async () => {
      // 먼저 백엔드에서 현재 데이터 동기화
      await syncFromBackend();

      // cardUid가 있으면 NFC 태그로 들어온 것 → 코인 지급 시도
      if (cardUid) {
        try {
          const response = await api.post("/nfc/checkin", { cardUid });

          if (response.data.success && !response.data.alreadyCheckedIn) {
            // 백엔드에서 보상 지급됨 → 다시 동기화해서 최신 데이터 반영
            await syncFromBackend();
          }
          setReceivedToday(true);
        } catch (error: any) {
          console.error("NFC 보상 처리 실패:", error);
          // 오늘 이미 받았는지 확인
          try {
            const statusRes = await api.get("/nfc/checkin/status");
            setReceivedToday(statusRes.data.checkedInToday);
          } catch {
            // 상태 확인 실패 시 무시
          }
        }
      } else {
        // cardUid 없으면 오늘 받았는지만 확인
        try {
          const response = await api.get("/nfc/checkin/status");
          setReceivedToday(response.data.checkedInToday);
        } catch (error) {
          console.error("상태 확인 실패:", error);
        }
      }
      setIsLoading(false);
    };

    processNfcReward();
  }, [cardUid, syncFromBackend]);

  // report 카드 효과 스타일
  const cardClass = "bg-white rounded-xl shadow-sm";

  return (
    <div className="flex-1 flex flex-col justify-center py-0 ">
      <div className="flex flex-col gap-10">
        {/* 1) 코인 영역: 카드로 감싸기 */}
        <div
          className={`flex flex-col items-center w-full max-w-md mx-auto gap-4 ${cardClass} px-6 py-6`}
        >
          {isLoading ? (
            <div className="text-[#795549] mt-12">로딩 중...</div>
          ) : receivedToday ? (
            <>
              <div className="text-2xl text-[#795549] font-bold mt-12 animate-bounce">
                코인+15 획득!
              </div>
              <div className="animate-[spin_2s_ease-in-out_1]">
                <img src="/assets/coin.svg" alt="coin" />
              </div>
              <div className="w-full text-center mt-0 text-[#795549]">
                당신의 한 작은 걸음이, 내일의 큰 변화가 됩니다.
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl text-[#795549] font-bold mt-12 animate-bounce">
                오늘의 보상
              </div>
              <div className="opacity-70">
                <img src="/assets/coin.svg" alt="coin" />
              </div>
              <div className="w-full text-center mt-0 text-[#795549]">
                NFC 태그를 찍어 코인을 받으세요!
              </div>
            </>
          )}
        </div>

        {/* 2) 성장 영역: 카드로 감싸기 */}
        <div
          className={`flex flex-col items-center justify-center gap-4 mt-6 w-full max-w-md mx-auto ${cardClass} px-6 py-6`}
        >
          <img src={growth.asset} alt="" />
          <p className="text-[#795549]">{growth.text}</p>
          <XpBar level={level} xp={xp} xpToNext={xpToNext} className="mt-4" />
        </div>

        {/* CTA */}
        <section className="w-full mt-4">
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
