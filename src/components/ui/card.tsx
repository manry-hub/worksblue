"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          cardRef.current = node;
        }}
        onMouseMove={handleMouseMove}
        className={cn(
          "group relative overflow-hidden rounded-2xl glass-card",
          "border border-white/[0.06]",
          "transition-all duration-500 ease-out",
          className
        )}
        {...props}
      >
        {/* Hover spotlight effect */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(59,130,246,0.1),transparent_40%)]" />
        </div>
        {/* Inner top highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] z-0" />
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
)
Card.displayName = "Card"
