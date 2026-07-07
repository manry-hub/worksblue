import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "success" | "warning" | "error" | "accent" | "blue"
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase font-medium",
          "border",
          {
            "bg-white/[0.03] text-foreground-muted border-white/[0.08]": variant === "neutral",
            "bg-green-500/10 text-green-400 border-green-500/20": variant === "success",
            "bg-orange-500/10 text-orange-400 border-orange-500/20": variant === "warning",
            "bg-red-500/10 text-red-400 border-red-500/20": variant === "error",
            "bg-accent/10 text-accent-bright border-accent/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]": variant === "accent",
            "bg-blue-500/10 text-blue-400 border-blue-500/30": variant === "blue",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"
