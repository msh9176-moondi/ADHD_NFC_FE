// src/components/common/XpBar.tsx
import { cn } from '@/lib/utils';

type Props = {
  level: number;
  xp: number;
  xpToNext: number;
  className?: string;
};

export default function XpBar({ level, xp, xpToNext, className }: Props) {
  const pct = Math.min(100, Math.max(0, (xp / xpToNext) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2 text-[#795549]">
        <div className="font-bold">LV. {level}</div>
        <div className="text-sm">
          {xp} / {xpToNext} XP
        </div>
      </div>

      <div className="w-full h-4 rounded-full bg-[#EFDDC3] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#795549] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
