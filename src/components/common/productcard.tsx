import { Card } from '@/components/ui/card';
import { PrimaryPillButton } from '@/components/common/PillButton';

type ProductCardProps = {
  title: string;
  desc: string;
  imageSrc: string;
  price?: number;
  onBuy?: () => void;
  buttonText?: string;
  className?: string;
  isComingSoon?: boolean;
};

function ProductCard({
  title,
  desc,
  imageSrc,
  price,
  onBuy,
  buttonText = '구매하기',
  className = '',
  isComingSoon = false,
}: ProductCardProps) {
  const disabled = isComingSoon; // ✅ 이 줄 추가

  return (
    <Card
      className={[
        'w-full rounded-2xl bg-white',
        'px-4 py-4',
        'flex flex-col items-center justify-between',
        'min-h-[220px]',
        disabled ? 'opacity-80' : '',
        className,
      ].join(' ')}
    >
      {/* 상단: 이름 + 준비중 배지 */}
      <div className="w-full flex items-center justify-center gap-2">
        <div className="text-[16px] font-extrabold text-[#795549] text-center">
          {title}
        </div>
        {isComingSoon && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#795549]/10 text-[#795549] font-semibold">
            준비중
          </span>
        )}
      </div>

      {/* 중간: 이미지 */}
      <div className="flex-1 w-full flex items-center justify-center py-1">
        <img
          src={imageSrc}
          alt={title}
          className={[
            'w-[86px] h-[86px] object-contain',
            isComingSoon ? 'grayscale opacity-60' : '',
          ].join(' ')}
          draggable={false}
        />
      </div>

      {/* 가격 */}
      {typeof price === 'number' && (
        <div className="w-full text-center text-[14px] font-semibold text-[#795549]">
          {price.toLocaleString()} 코인
        </div>
      )}

      {/* 설명 */}
      <div
        className={[
          'w-full text-center text-[12px] leading-relaxed text-[#795549]/70 break-keep whitespace-pre-line',
          isComingSoon ? 'opacity-70' : '',
        ].join(' ')}
      >
        {desc}
      </div>

      {/* 버튼 */}
      <PrimaryPillButton
        className={[
          'h-10 px-8 rounded-full text-[12px] font-semibold',
          disabled
            ? 'bg-[#D9A77F]/40 text-white cursor-not-allowed hover:bg-[#D9A77F]/40'
            : 'bg-[#D9A77F] hover:bg-[#D9A77F]/90 text-white',
        ].join(' ')}
        onClick={disabled ? undefined : onBuy}
        type="button"
        disabled={disabled}
      >
        {disabled ? '준비중' : buttonText}
      </PrimaryPillButton>
    </Card>
  );
}

export { ProductCard };
