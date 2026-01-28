import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PrimaryPillButton } from '@/components/common/PillButton';

type OrderItem = {
  id: string;
  title: string;
  imageSrc: string;
  price: number;
  quantity: number;
  xpBonus?: number;
};

function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // location state에서 주문 정보 가져오기
  const state = location.state as {
    orderItem?: OrderItem;
    xpBonus?: number;
  } | null;

  const orderItem = state?.orderItem || {
    id: 'experience-gift',
    title: '체험단 전용 특전',
    imageSrc: '/assets/items/gift.png',
    price: 105,
    quantity: 1,
  };

  const xpBonus = state?.xpBonus || 0;

  return (
    <div className="flex flex-col items-center w-full mt-12">
      {/* 성공 아이콘 */}
      <section className="flex flex-col items-center justify-center w-full">
        <div className="w-24 h-24 rounded-full bg-[#DBA67A]/20 flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#DBA67A] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <div className="text-3xl text-[#795549] font-extrabold">
          결제 완료!
        </div>
        <div className="text-center text-[14px] text-[#795549]/70 mt-3">
          주문이 성공적으로 완료되었습니다
        </div>
      </section>

      {/* XP 보너스 표시 */}
      {xpBonus > 0 && (
        <section className="w-full mt-6">
          <Card className="p-4 bg-gradient-to-r from-[#DBA67A]/20 to-[#795549]/10 border-[#DBA67A]">
            <div className="flex items-center justify-center gap-3">
              <div className="text-3xl animate-bounce">🌳</div>
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#795549]">
                  +{xpBonus} XP 획득!
                </p>
                <p className="text-[12px] text-[#795549]/70 mt-1">
                  나무가 더 빨리 자라요!
                </p>
              </div>
              <div className="text-3xl animate-bounce">✨</div>
            </div>
          </Card>
        </section>
      )}

      {/* 주문 정보 카드 */}
      <section className="w-full mt-8">
        <Card className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F5F1EB] rounded-lg flex items-center justify-center">
                <img
                  src={orderItem.imageSrc}
                  alt={orderItem.title}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#795549]">
                  {orderItem.title}
                </h4>
                <p className="text-[12px] text-[#795549]/70 mt-1">
                  수량: {orderItem.quantity || 1}개
                </p>
              </div>
            </div>

            <div className="h-px bg-[#795549]/20" />

            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#795549]/70">주문번호</span>
                <span className="text-[#795549] font-medium">
                  {`ORD-${Date.now().toString().slice(-8)}`}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#795549]/70">결제일시</span>
                <span className="text-[#795549] font-medium">
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#795549]/70">배송 상태</span>
                <span className="text-[#DBA67A] font-medium">준비중</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 안내 메시지 */}
      <section className="w-full mt-6">
        <Card className="p-4 bg-[#DBA67A]/10 border-[#DBA67A]/30">
          <div className="flex gap-3">
            <span className="text-xl">{xpBonus > 0 ? '🌱' : '📦'}</span>
            <div>
              <p className="text-[13px] text-[#795549] font-medium">
                {xpBonus > 0 ? 'XP 보너스 적용 완료!' : '배송 안내'}
              </p>
              <p className="text-[12px] text-[#795549]/70 mt-1">
                {xpBonus > 0 ? (
                  <>
                    물뿌리개 효과로 나무에 {xpBonus} XP가 추가되었어요!
                    <br />
                    나무 성장 페이지에서 확인해보세요.
                  </>
                ) : (
                  <>
                    체험단 특전 상품은 순차적으로 발송됩니다.
                    <br />
                    배송 시작 시 알림을 보내드릴게요!
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* 버튼 영역 */}
      <section className="w-full mt-10 space-y-3">
        <PrimaryPillButton
          className="w-full text-[13px] font-semibold flex items-center justify-center gap-2"
          onClick={() => navigate('/growth')}
        >
          <span>🌳</span>
          <span>나무 보러가기</span>
        </PrimaryPillButton>

        <button
          type="button"
          onClick={() => navigate('/market')}
          className="w-full text-[13px] text-[#795549]/70 py-2"
        >
          마켓으로 돌아가기
        </button>
      </section>
    </div>
  );
}

export default CheckoutSuccessPage;
