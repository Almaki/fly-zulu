import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 border-[#27272a] bg-zinc-900/50 px-3 py-2 text-base text-[#fafafa] shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#fafafa] placeholder:text-[#71717a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:border-[#0066CC] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
