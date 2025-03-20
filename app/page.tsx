"use client"

import { Particles } from "@/components/ui/particles"
import TranscriptionSection from "@/components/transcription-section"
import { ShinyText } from "@/components/ui/shiny-text"
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
      
      <h1 className="relative z-10 mb-8 text-center">
        <ShinyText 
          text="Hertzel" 
          speed={3}
          colorShift={false}
          className="text-8xl font-bold md:text-9xl lg:text-9xl font-Tektur text-transparent"
          style={{
            backgroundImage: "linear-gradient(120deg, rgba(15,15,15,0.1) 40%, rgba(150,150,150,0.3) 50%, rgba(15,15,15,0.1) 60%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text"
          }}
        />
      </h1>
      
      <div className="z-10 w-full max-w-2xl">
        <TranscriptionSection 
          onTranscriptionStart={handleTranscriptionStart}
          onTranscriptionEnd={handleTranscriptionEnd}
        />
      </div>
      
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        © 2025 Hertzel
      </footer>
    </main>
  )
}
