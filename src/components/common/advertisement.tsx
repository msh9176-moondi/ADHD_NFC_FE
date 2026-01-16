import { Button } from '../ui/button';

function Advertisement() {
  const handlePurchaseClick = () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSeaKGZtvot0w7zUkb7cRCb0h6p1Z8WznEB8450JP4BcSpqvPQ/viewform?usp=publish-editor',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* <div className="flex flex-col items-center gap-3">
        <img src="/assets/logo.svg" alt="" />
      </div> */}

      <div className="w-full px-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePurchaseClick}
          className="w-full h-12 rounded-full bg-[#795549] text-white border-0 hover:bg-white hover:text-[#795549] cursor-pointer text-[20px] font-semibold"
        >
          구매하기
        </Button>
      </div>

      <div className="text-sm text-[#795549] opacity-80">
        체험해주셔서 감사합니다.
      </div>
    </div>
  );
}

export { Advertisement };
