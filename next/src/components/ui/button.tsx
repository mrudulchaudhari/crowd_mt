import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-[#0B64FF] text-white shadow hover:bg-[#0B64FF]/90 focus-visible:ring-[#0B64FF]/50",
        success: "bg-[#22C55E] text-white shadow hover:bg-[#22C55E]/90 focus-visible:ring-[#22C55E]/50",
        warning: "bg-[#F59E0B] text-white shadow hover:bg-[#F59E0B]/90 focus-visible:ring-[#F59E0B]/50",
        danger: "bg-[#EF4444] text-white shadow hover:bg-[#EF4444]/90 focus-visible:ring-[#EF4444]/50",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/50",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-secondary/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
