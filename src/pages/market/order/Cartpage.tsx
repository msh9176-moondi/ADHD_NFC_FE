import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PrimaryPillButton } from '@/components/common/PillButton';
import { useProgressStore } from '@/store/progress';

type CartItem = {
  id: string;
  title: string;
  desc: string;
  imageSrc: string;
  price: number;
  quantity: number;
  xpBonus?: number;
};

const DEFAULT_CART_ITEM: CartItem = {
  id: 'experience-gift',
  title: '체험단 전용 특전',
  desc: '체험단 얼리버드 구매 특전: 추가 구성 증정',
  imageSrc: '/assets/items/gift.png',
  price: 105,
  quantity: 1,
};

function CartpagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const coins = useProgressStore((s) => s.coins);

  // location state에서 전달된 상품 정보 확인
  const productFromState = (location.state as { product?: CartItem })?.product;

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (productFromState) {
      return [{ ...productFromState, quantity: 1 }];
    }
    return [DEFAULT_CART_ITEM];
  });

  // location state가 변경되면 장바구니 업데이트
  useEffect(() => {
    if (productFromState) {
      setCartItems([{ ...productFromState, quantity: 1 }]);
    }
  }, [productFromState?.id]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const canAfford = coins >= totalPrice;

  return (
    <div className="flex flex-col items-center w-full mt-12">
      {/* 헤더 */}
      <section className="relative flex flex-col items-center justify-center w-full">
        {/* 코인 칩 */}
        <div className="absolute -right-3 -top-6 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm">
          <img src="/assets/dopacoin.svg" alt="coin" className="w-6 h-6" />
          <span className="text-[16px] font-semibold text-[#795549]">
            {coins.toLocaleString()}
          </span>
        </div>

        <div className="text-4xl text-[#795549] font-extrabold">장바구니</div>
        <div className="text-center text-[12px] text-[#795549] mt-3">
          선택한 아이템을 확인하세요
        </div>
      </section>

      {/* 장바구니 아이템 목록 */}
      <section className="w-full mt-6 space-y-4">
        {cartItems.length === 0 ? (
          <Card className="p-6">
            <div className="text-center text-[#795549]/70">
              장바구니가 비어있습니다
            </div>
          </Card>
        ) : (
          cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* 상품 이미지 */}
                <div className="w-20 h-20 bg-[#F5F1EB] rounded-lg flex items-center justify-center">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="w-14 h-14 object-contain"
                  />
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#795549]">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-[#795549]/70 mt-1">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* 가격 */}
                    <div className="flex items-center gap-1">
                      <img
                        src="/assets/dopacoin.svg"
                        alt="coin"
                        className="w-4 h-4"
                      />
                      <span className="text-[14px] font-semibold text-[#795549]">
                        {item.price}
                      </span>
                    </div>

                    {/* 수량 조절 */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-[#F5F1EB] text-[#795549] font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-[14px] font-semibold text-[#795549] w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-[#F5F1EB] text-[#795549] font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[#795549]/50 hover:text-[#795549] text-xl self-start"
                >
                  ×
                </button>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* 결제 요약 */}
      {cartItems.length > 0 && (
        <section className="w-full mt-6">
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#795549]">총 결제금액</span>
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

            {!canAfford && (
              <p className="text-[12px] text-red-500 mt-2 text-right">
                코인이 부족합니다
              </p>
            )}
          </Card>
        </section>
      )}

      {/* 버튼 영역 */}
      <section className="w-full mt-8 space-y-3">
        <PrimaryPillButton
          className="w-full text-[13px] font-semibold"
          onClick={() =>
            navigate('/market/order/checkout', {
              state: { cartItems },
            })
          }
          disabled={cartItems.length === 0 || !canAfford}
        >
          결제하기
        </PrimaryPillButton>

        <button
          type="button"
          onClick={() => navigate('/market')}
          className="w-full text-[13px] text-[#795549]/70 py-2"
        >
          쇼핑 계속하기
        </button>
      </section>
    </div>
  );
}

export default CartpagePage;
