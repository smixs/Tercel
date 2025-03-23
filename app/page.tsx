"use client"

import { Particles } from "@/components/ui/particles"
import TranscriptionSection from "@/components/transcription-section"
import InfinityEffect from "@/components/ui/infinity-effect"
import { GooeyText } from "@/components/ui/gooey-text"
import { useState } from "react"

export default function Home() {
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  // Обработчики для отслеживания состояния транскрибирования
  const handleTranscriptionStart = () => {
    setIsTranscribing(true)
  }
  
  const handleTranscriptionEnd = () => {
    setIsTranscribing(false)
  }
  
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <Particles 
        className="absolute inset-0" 
        quantity={150} 
        ease={50} 
        size={1.2}
        speedFactor={isTranscribing ? 5 : 1} 
      />
      
      <div className="flex flex-col items-center gap-2">
        {/* Название с анимацией GooeyText */}
        <GooeyText
          texts={["Petlya", "Transcription", "Audio"]}
          morphTime={1}
          cooldownTime={0.25}
          className="h-16 font-rubik-glitch"
          textClassName="text-4xl md:text-5xl lg:text-6xl tracking-wider text-white font-bold"
        />
        
        {/* Знак бесконечности */}
        <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem]">
          <InfinityEffect particleCount={600} />
        </div>
      </div>
      
      <div className="w-full max-w-2xl">
        <TranscriptionSection 
          onTranscriptionStart={handleTranscriptionStart}
          onTranscriptionEnd={handleTranscriptionEnd}
        />
      </div>
      
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        © 2025 Petlya
      </footer>
    </main>
  )
}
