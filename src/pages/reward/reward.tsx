import { SocialPillButton } from '@/components/common/PillButton';
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

  return (
    <div className="flex-1 flex flex-col justify-center py-8">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-center w-full max-w-md mx-auto gap-4">
          <div className="text-2xl text-[#795549] font-bold mt-12">
            코인+15 획득!
          </div>

          <button
            type="button"
            onClick={() => addXp(15)}
            className="active:scale-95 transition-transform"
            aria-label="코인 눌러서 XP 획득"
          >
            <img src="/assets/coin.svg" alt="coin" />
          </button>

          <div className="w-full text-right mt-2 text-[#795549]">
            지금 당신의 한 작은 걸음이, 내일의 큰 변화가 됩니다.
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src={growth.asset} alt="" />
          <p className="text-[#795549]">{growth.text}</p>
          <XpBar level={level} xp={xp} xpToNext={xpToNext} className="mt-4" />
        </div>

        <div className="flex flex-col w-full max-w-md mx-auto">
          <div className="space-y-3 mb-6">
            <SocialPillButton onClick={() => navigate('/report')}>
              기록하러 가기
            </SocialPillButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RewardPage;
