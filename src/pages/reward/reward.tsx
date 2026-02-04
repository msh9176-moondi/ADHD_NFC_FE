import { PrimaryPillButton } from "@/components/common/PillButton";
import XpBar from "@/components/common/XpBar";
import { api } from "@/lib/api";
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

      // 페이지 방문할 때마다 체크인 (조회수 +1)
      try {
        const response = await api.post(
          "/nfc/checkin",
          cardUid ? { cardUid } : {},
        );
        const data = response.data;

        setTotalTagCount(data.totalTagCount || 0);
        setCoinAwarded(!data.alreadyCheckedIn && data.success);
        setReceivedToday(data.alreadyCheckedIn || data.success);

        if (data.success && !data.alreadyCheckedIn) {
          await syncFromBackend();
        }
      } catch (error: any) {
        console.error("NFC 보상 처리 실패:", error);
        try {
          const statusRes = await api.get("/nfc/checkin/status");
          setReceivedToday(statusRes.data.checkedInToday);
          setTotalTagCount(statusRes.data.totalTagCount || 0);
        } catch {
          // 상태 확인 실패 시 무시
        }
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
