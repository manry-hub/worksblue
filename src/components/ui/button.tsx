import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "default", icon, children, ...props }, ref) => {
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-[background,transform,box-shadow,border-color] duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-base",
          "active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "luxury-button-primary": variant === "primary",
            "bg-white/[0.05] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.2)] hover:bg-white/[0.08] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)]": variant === "secondary",
            "bg-transparent text-foreground-muted hover:bg-white/[0.05] hover:text-foreground": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {icon && <span className={cn("mr-2 [&>svg]:w-4 [&>svg]:h-4", { "mr-0": !children })}>{icon}</span>}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
