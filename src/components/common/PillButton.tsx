// src/components/common/PillButton.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PillButtonProps = React.ComponentProps<typeof Button>;

export function PrimaryPillButton({ className, ...props }: PillButtonProps) {
  return (
    <Button
      className={cn(
        "h-11 rounded-full text-white font-medium bg-[#795549] hover:bg-[#795549]/90",
        className,
      )}
      {...props}
    />
  );
}

export function SocialPillButton({
  className,
  variant = "outline",
  ...props
}: PillButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "w-full h-12 rounded-full font-medium bg-[#F5F0E5] text-[#795549] border-0 hover:bg-[#F5F0E5]/80 hover:text-[#795549] cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}
