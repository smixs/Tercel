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
      
      {/* Название с анимацией GooeyText */}
      <div className="absolute top-6 z-20 left-0 right-0 mx-auto text-center">
        <div className="relative mx-auto h-24 w-full max-w-md">
          <GooeyText
            texts={["Petlya", "Transcription", "Audio"]}
            morphTime={1}
            cooldownTime={0.25}
            className="h-full font-warnes"
            textClassName="text-4xl md:text-5xl lg:text-6xl tracking-wider text-white font-bold"
          />
        </div>
      </div>
      
      {/* Увеличенный компонент InfinityEffect */}
      <div className="relative z-10 mb-4 w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] mx-auto">
        <InfinityEffect particleCount={600} />
      </div>
      
      <div className="z-10 w-full max-w-2xl">
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
