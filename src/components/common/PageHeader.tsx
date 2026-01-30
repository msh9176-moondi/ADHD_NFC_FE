import { CoinChip } from './CoinChip';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  coins?: number;
  titleClassName?: string;
};

export function PageHeader({
  title,
  subtitle,
  coins,
  titleClassName = 'text-5xl',
}: PageHeaderProps) {
  return (
    <section className="relative flex flex-col items-center justify-center w-full">
      {coins !== undefined && (
        <CoinChip coins={coins} className="absolute -right-3 -top-6" />
      )}

      <div className={`text-[#795549] font-extrabold ${titleClassName}`}>
        {title}
      </div>
      {subtitle && (
        <div className="text-center text-[12px] text-[#795549] mt-3">
          {subtitle}
        </div>
      )}
    </section>
  );
}
