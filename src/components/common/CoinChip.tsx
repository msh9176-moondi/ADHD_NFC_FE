type CoinChipProps = {
  coins: number;
  className?: string;
};

export function CoinChip({ coins, className = '' }: CoinChipProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm ${className}`}
    >
      <img src="/assets/dopacoin.svg" alt="coin" className="w-6 h-6" />
      <span className="text-[16px] font-semibold text-[#795549]">
        {coins.toLocaleString()}
      </span>
    </div>
  );
}
