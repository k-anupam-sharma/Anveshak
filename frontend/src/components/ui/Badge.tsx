import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "warning" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-slate-900": variant === "default",
          "border-transparent bg-secondary text-white": variant === "secondary",
          "border-transparent bg-danger text-white": variant === "danger",
          "border-transparent bg-accent text-slate-900": variant === "warning",
          "border-transparent bg-green-500 text-white": variant === "success",
          "text-slate-100": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
