import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  icon: React.ReactNode
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "default", icon, ...props }, ref) => {
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-base",
          "active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-white shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-accent-bright": variant === "primary",
            "bg-white/[0.05] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.2)] hover:bg-white/[0.08]": variant === "secondary",
            "bg-transparent text-foreground-muted hover:bg-white/[0.05] hover:text-foreground": variant === "ghost",
            "h-10 w-10 [&>svg]:w-5 [&>svg]:h-5": size === "default",
            "h-8 w-8 [&>svg]:w-4 [&>svg]:h-4": size === "sm",
            "h-12 w-12 [&>svg]:w-6 [&>svg]:h-6": size === "lg",
          },
          className
        )}
        {...props}
      >
        {icon}
      </button>
    )
  }
)
IconButton.displayName = "IconButton"
