"use client"

import { Particles } from "@/components/ui/particles"
import TranscriptionSection from "@/components/transcription-section"
import { ShinyText } from "@/components/ui/shiny-text"
import InfinityEffect from "@/components/ui/infinity-effect"
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
      
      {/* Название Petlya в новом формате */}
      <h1 className="absolute top-8 z-10 text-center">
        <ShinyText 
          text="Petlya" 
          speed={2}
          colorShift={false}
          className="text-3xl md:text-4xl font-normal text-transparent font-warnes"
          style={{
            backgroundImage: "linear-gradient(120deg, rgba(15,15,15,0.1) 40%, rgba(220,220,220,0.5) 50%, rgba(15,15,15,0.1) 60%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text"
          }}
        />
      </h1>
      
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
