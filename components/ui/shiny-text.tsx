import { cn } from "@/lib/utils"

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className
}: ShinyTextProps) {
  // Для отладки: добавим console.log
  console.log("ShinyText render:", { text, disabled, speed, className });
  
  return (
    <div
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-gradient-to-r from-gray-600 to-gray-600",
        !disabled && "animate-shine",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(120deg, 
          #4b5563 40%,
          #f9fafb 50%,
          #4b5563 60%
        )`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: `${speed}s`,
      } as React.CSSProperties}
    >
      {text}
    </div>
  )
} 