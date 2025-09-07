import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      style={{
        backgroundColor: "hsl(var(--secondary))",
        position: "relative",
        height: "8px",
        width: "100%",
        flexGrow: 1,
        borderRadius: "9999px",
      }}
    >
      <SliderPrimitive.Range
        style={{
          position: "absolute",
          backgroundColor: "hsl(var(--primary))",
          height: "100%",
          borderRadius: "9999px",
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      style={{
        display: "block",
        height: "16px",
        width: "16px",
        borderRadius: "50%",
        border: "2px solid hsl(var(--primary))",
        backgroundColor: "hsl(var(--background))",
        cursor: "pointer",
      }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }