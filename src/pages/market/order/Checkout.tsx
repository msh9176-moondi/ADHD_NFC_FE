import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PrimaryPillButton, PageHeader } from '@/components/common';
import { useProgressStore } from '@/store/progress';

type OrderItem = {
  id: string;
  title: string;
  imageSrc: string;
  price: number;
  quantity: number;
  xpBonus?: number;
};

const DEFAULT_ORDER: OrderItem = {
  id: 'experience-gift',
  title: '체험단 전용 특전',
  imageSrc: '/assets/items/gift.png',
  price: 105,
  quantity: 1,
};

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { coins, spendCoins, addXp } = useProgressStore();

  // location state에서 전달된 장바구니 정보 확인
  const cartItemsFromState = (
    location.state as { cartItems?: OrderItem[] }
  )?.cartItems;
  const firstItem = cartItemsFromState?.[0];

  const [orderItem] = useState<OrderItem>(firstItem || DEFAULT_ORDER);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = orderItem.price * orderItem.quantity;
  const canAfford = coins >= totalPrice;

  const isFormValid =
    form.name.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.address.trim() !== '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!isFormValid || !canAfford) return;

    setIsProcessing(true);

    // 코인 차감
    const success = spendCoins(totalPrice);

    if (success) {
      // 물뿌리개 구매 시 XP 보너스 지급
      const xpBonus = orderItem.xpBonus || 0;
      if (xpBonus > 0) {
        addXp(xpBonus);
      }

      // 결제 성공 시 성공 페이지로 이동 (상품 정보 전달)
      setTimeout(() => {
        navigate('/market/order/checkoutsuccess', {
          state: {
            orderItem,
            xpBonus,
          },
        });
      }, 500);
    } else {
      setIsProcessing(false);
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-12">
      {/* 헤더 */}
      <PageHeader
        title="결제하기"
        subtitle="주문 정보를 확인해주세요"
        coins={coins}
        titleClassName="text-4xl"
      />

      {/* 주문 상품 */}
      <section className="w-full mt-6">
        <h3 className="text-[14px] font-semibold text-[#795549] mb-2">
          주문 상품
        </h3>
        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-[#F5F1EB] rounded-lg flex items-center justify-center">
              <img
                src={orderItem.imageSrc}
                alt={orderItem.title}
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-[14px] font-semibold text-[#795549]">
                {orderItem.title}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                <img
                  src="/assets/dopacoin.svg"
                  alt="coin"
                  className="w-4 h-4"
                />
                <span className="text-[13px] text-[#795549]">
                  {orderItem.price} × {orderItem.quantity}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 배송 정보 */}
      <section className="w-full mt-6">
        <h3 className="text-[14px] font-semibold text-[#795549] mb-2">
          배송 정보
        </h3>
        <Card className="p-4 space-y-4">
          <div>
            <label className="text-[12px] text-[#795549]/70 block mb-1">
              받는 분
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2 rounded-lg bg-[#F5F1EB] text-[14px] text-[#795549] placeholder:text-[#795549]/40 outline-none focus:ring-2 focus:ring-[#DBA67A]"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#795549]/70 block mb-1">
              연락처
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 rounded-lg bg-[#F5F1EB] text-[14px] text-[#795549] placeholder:text-[#795549]/40 outline-none focus:ring-2 focus:ring-[#DBA67A]"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#795549]/70 block mb-1">
              주소
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              placeholder="주소를 입력하세요"
              className="w-full px-3 py-2 rounded-lg bg-[#F5F1EB] text-[14px] text-[#795549] placeholder:text-[#795549]/40 outline-none focus:ring-2 focus:ring-[#DBA67A]"
            />
          </div>

          <div>
            <label className="text-[12px] text-[#795549]/70 block mb-1">
              상세주소
            </label>
            <input
              type="text"
              name="addressDetail"
              value={form.addressDetail}
              onChange={handleInputChange}
              placeholder="상세주소를 입력하세요 (선택)"
              className="w-full px-3 py-2 rounded-lg bg-[#F5F1EB] text-[14px] text-[#795549] placeholder:text-[#795549]/40 outline-none focus:ring-2 focus:ring-[#DBA67A]"
            />
          </div>
        </Card>
      </section>

      {/* 결제 수단 */}
      <section className="w-full mt-6">
        <h3 className="text-[14px] font-semibold text-[#795549] mb-2">
          결제 수단
        </h3>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#DBA67A] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#DBA67A]" />
            </div>
            <div className="flex items-center gap-2">
              <img src="/assets/dopacoin.svg" alt="coin" className="w-5 h-5" />
              <span className="text-[14px] text-[#795549]">도파코인 결제</span>
            </div>
          </div>
        </Card>
      </section>

      {/* 결제 금액 */}
      <section className="w-full mt-6">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[13px] text-[#795549]/70">
              <span>상품 금액</span>
              <span>{totalPrice.toLocaleString()} 코인</span>
            </div>
            <div className="flex justify-between text-[13px] text-[#795549]/70">
              <span>배송비</span>
              <span>무료</span>
            </div>
            <div className="h-px bg-[#795549]/20 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-semibold text-[#795549]">
                총 결제금액
              </span>
              <div className="flex items-center gap-1">
                <img
                  src="/assets/dopacoin.svg"
                  alt="coin"
                  className="w-5 h-5"
                />
                <span className="text-[18px] font-bold text-[#795549]">
                  {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {!canAfford && (
            <p className="text-[12px] text-red-500 mt-3 text-right">
              코인이 부족합니다 (보유: {coins.toLocaleString()} 코인)
            </p>
          )}
        </Card>
      </section>

      {/* 버튼 영역 */}
      <section className="w-full mt-8 space-y-3">
        <PrimaryPillButton
          className="w-full text-[13px] font-semibold"
          onClick={handleCheckout}
          disabled={!isFormValid || !canAfford || isProcessing}
        >
          {isProcessing ? '결제 중...' : `${totalPrice.toLocaleString()} 코인 결제하기`}
        </PrimaryPillButton>

        <button
          type="button"
          onClick={() => navigate('/market/order/cartpage')}
          className="w-full text-[13px] text-[#795549]/70 py-2"
        >
          장바구니로 돌아가기
        </button>
      </section>
    </div>
  );
}

export default CheckoutPage;
