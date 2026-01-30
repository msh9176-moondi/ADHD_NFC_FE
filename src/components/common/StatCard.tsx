type StatCardProps = {
  emoji?: string;
  textIcon?: string;
  value: number | string;
  label: string;
  className?: string;
};

export function StatCard({
  emoji,
  textIcon,
  value,
  label,
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-[#F5F0E5] rounded-2xl p-5 text-center ${className}`}>
      {emoji && (
        <div className="text-[28px] mb-2" aria-hidden>
          {emoji}
        </div>
      )}
      {textIcon && (
        <div className="text-[28px] font-extrabold text-[#795549] mb-2">
          {textIcon}
        </div>
      )}
      <div className="text-[20px] font-bold text-[#795549]">{value}</div>
      <div className="text-[12px] font-semibold text-[#DBA67A] mt-1">
        {label}
      </div>
    </div>
  );
}
