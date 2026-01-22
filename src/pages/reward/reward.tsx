import {
  PrimaryPillButton,
  SocialPillButton,
} from '@/components/common/PillButton';
import XpBar from '@/components/common/XpBar';
import { useProgressStore } from '@/store/progress';
import { useNavigate } from 'react-router-dom';

const GROWTH_STAGES = [
  { minLevel: 1, asset: '/assets/seed-1.svg', text: '씨앗이 자라고 있어요!!' },
  { minLevel: 2, asset: '/assets/seed-2.svg', text: '씨앗이 돋아났어요!' },
  { minLevel: 3, asset: '/assets/seed-3.svg', text: '새싹이 자라고 있어요!!' },
  { minLevel: 4, asset: '/assets/seed-4.svg', text: '잎이 무성해졌어요!' },
  { minLevel: 5, asset: '/assets/seed-5.svg', text: '작은 나무가 되었어요!' },
  { minLevel: 6, asset: '/assets/seed-6.svg', text: '나무가 자라고 있어요!' },
  { minLevel: 7, asset: '/assets/seed-7.svg', text: '큰 나무가 되었어요!' },
  { minLevel: 8, asset: '/assets/seed-8.svg', text: '나무에 열매가 맺혔어요!' },
] as const;

function getGrowthStage(level: number) {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (level >= GROWTH_STAGES[i].minLevel) return GROWTH_STAGES[i];
  }
  return GROWTH_STAGES[0];
}

function RewardPage() {
  const navigate = useNavigate();
  const { level, xp, xpToNext, addXp } = useProgressStore();
  const growth = getGrowthStage(level);

  // report 카드 효과 스타일
  const cardClass = 'bg-white rounded-xl shadow-sm';

  return (
    <div className="flex-1 flex flex-col justify-center py-0">
      <div className="flex flex-col gap-10">
        {/* 1) 코인 영역: 카드로 감싸기 */}
        <div
          className={`flex flex-col items-center w-full max-w-md mx-auto gap-4 ${cardClass} px-6 py-6`}
        >
          <div className="text-2xl text-[#795549] font-bold mt-12">
            코인+15 획득!
          </div>
          <button
            type="button"
            onClick={() => addXp(15)}
            className="active:scale-95 transition-transform mt-8"
            aria-label="코인 눌러서 XP 획득"
          >
            <img src="/assets/coin.svg" alt="coin" />
          </button>

          <div className="w-full text-right mt-0 text-[#795549]">
            당신의 한 작은 걸음이, 내일의 큰 변화가 됩니다.
          </div>
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
            className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
            onClick={() => navigate('/report')}
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
