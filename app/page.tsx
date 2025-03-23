"use client"

import { Particles } from "@/components/ui/particles"
import TranscriptionSection from "@/components/transcription-section"
import InfinityEffect from "@/components/ui/infinity-effect"
import { GooeyText } from "@/components/ui/gooey-text"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function Home() {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  
  // Обработчики для отслеживания состояния транскрибирования
  const handleTranscriptionStart = () => {
    setIsTranscribing(true)
  }
  
  const handleTranscriptionEnd = () => {
    setIsTranscribing(false)
  }

  const handleResultChange = (hasResult: boolean) => {
    setHasResult(hasResult)
  }
  
  return (
    <main className="relative min-h-screen bg-background">
      <Particles 
        className="fixed inset-0 z-0" 
        quantity={150} 
        ease={50} 
        size={1.2}
        speedFactor={isTranscribing ? 5 : 1} 
      />
      
      {/* Контейнер с заголовком и анимацией в потоке документа */}
      <div className="relative w-full flex flex-col items-center pt-16 md:pt-20">
        <GooeyText
          texts={["Zapis", "For", "Your", "Information"]}
          morphTime={1}
          cooldownTime={0.25}
          className="h-16"
          textClassName="text-4xl md:text-5xl lg:text-6xl tracking-wider text-white font-bold"
        />
        
        <div className="w-60 h-60 md:w-96 md:h-66 lg:w-[22rem] lg:h-[22rem] -mt-6 md:-mt-8">
          <InfinityEffect 
            particleCount={600}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Контейнер с результатом */}
      <div className="w-full flex items-center justify-center mt-8">
        <div className="w-full max-w-2xl px-4 mb-16">
          <TranscriptionSection 
            onTranscriptionStart={handleTranscriptionStart}
            onTranscriptionEnd={handleTranscriptionEnd}
            onResultChange={handleResultChange}
          />
        </div>
      </div>
      
      <footer className="fixed bottom-4 left-0 right-0 text-center text-sm text-muted-foreground z-50">
        © 2025 TDI AI
      </footer>
    </main>
  )
}
