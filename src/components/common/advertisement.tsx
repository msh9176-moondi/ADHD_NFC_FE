import { Button } from '../ui/button';

function Advertisement() {
  const handlePurchaseClick = () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSeaKGZtvot0w7zUkb7cRCb0h6p1Z8WznEB8450JP4BcSpqvPQ/viewform?usp=dialog',
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="w-full max-w-[320px] rounded-2xl border border-[#795549]/10 bg-white/70 backdrop-blur-sm shadow-sm">
      <div className="p-4">
        {/* 헤더: 광고 주장 줄이고 '추천' 톤 */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[#3a2c27]">
            플래너 자세히 보기
          </div>
          <div className="text-xs text-[#795549]/60">FLOCA</div>
        </div>

        <div className="mt-2 text-xs leading-relaxed text-[#795549]/70">
          플래너 경험을 더 편하게 만드는 옵션을 소개해요.
        </div>

        {/* 이미지: 소재감 + 은은한 프레임 */}
        <div className="mt-4 overflow-hidden rounded-xl border border-[#795549]/10 bg-[#faf7f6]">
          <img
            src="/assets/FLOCA.png"
            alt="FLOCA"
            className="h-[160px] w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* CTA: 과한 강조 대신 고급스럽게 */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePurchaseClick}
            className="h-11 w-full rounded-full bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549] cursor-pointer text-[15px] font-medium"
          >
            지금 구매 예약하기
          </Button>

          <div className="mt-2 text-center text-[11px] text-[#795549]/60">
            체험해주셔서 감사합니다.
          </div>
        </div>
      </div>
    </div>
  );
}

export { Advertisement };
