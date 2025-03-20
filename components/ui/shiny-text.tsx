import { cn } from "@/lib/utils"

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  colorShift?: boolean
  colorSpeed?: number
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className,
  colorShift = false,
  colorSpeed = 12
}: ShinyTextProps) {
  // Для отладки: добавим console.log
  console.log("ShinyText render:", { text, disabled, speed, colorShift, colorSpeed });
  
  return (
    <div
      className={cn(
        "inline-block bg-clip-text text-transparent",
        !disabled && "animate-shine",
        colorShift && "animate-text-color",
        className
      )}
      style={{
        // При colorShift используем только backgroundSize и WebkitBackgroundClip
        // анимация и gradient-background задаются через классы
        backgroundImage: !colorShift ? `linear-gradient(120deg, 
          #4b5563 40%,
          #f9fafb 50%,
          #4b5563 60%
        )` : undefined,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animation: !disabled ? 
          (colorShift ? 
            `shine ${speed}s linear infinite, textColorPulse ${colorSpeed}s ease infinite` : 
            `shine ${speed}s linear infinite`) :
          'none',
      } as React.CSSProperties}
    >
      {text}
    </div>
  )
} 