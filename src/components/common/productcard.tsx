// src/components/common/productcard.tsx
import { Card } from '@/components/ui/card';
import { PrimaryPillButton } from '@/components/common/PillButton';

type ProductCardProps = {
  title: string;
  desc: string;
  imageSrc: string;
  onBuy?: () => void;
  buttonText?: string;
  className?: string;
};

function ProductCard({
  title,
  desc,
  imageSrc,
  onBuy,
  buttonText = '구매하기',
  className = '',
}: ProductCardProps) {
  return (
    <Card
      className={[
        'w-full rounded-2xl bg-white',
        'px-4 py-4',
        'flex flex-col items-center justify-between',
        // 이미지처럼 카드 높이 고정(필요하면 숫자만 조절)
        'min-h-[220px]',
        className,
      ].join(' ')}
    >
      {/* 상단: 이름 */}
      <div className="w-full text-center text-[14px] font-extrabold text-[#795549]">
        {title}
      </div>

      {/* 중간: 이미지 */}
      <div className="flex-1 w-full flex items-center justify-center py-1">
        <img
          src={imageSrc}
          alt={title}
          className="w-[86px] h-[86px] object-contain"
          draggable={false}
        />
      </div>

      {/* 하단: 설명 */}
      <div className="w-full text-center text-[12px] leading-relaxed text-[#795549]/70 break-keep whitespace-pre-line">
        {desc}
      </div>

      {/* 하단 중앙: 버튼(필버튼) */}
      <PrimaryPillButton
        className=" h-10 px-8 rounded-full bg-[#D9A77F] hover:bg-[#D9A77F]/90 text-white text-[12px] font-semibold"
        onClick={onBuy}
        type="button"
      >
        {buttonText}
      </PrimaryPillButton>
    </Card>
  );
}

export { ProductCard };
