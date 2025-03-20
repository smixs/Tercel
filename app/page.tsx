import { Particles } from "@/components/ui/particles"
import TranscriptionSection from "@/components/transcription-section"
import { ShinyText } from "@/components/ui/shiny-text"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <Particles className="absolute inset-0" quantity={150} ease={50} size={1.2} />
      
      <h1 className="relative z-10 mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        <ShinyText 
          text="Tercel" 
          speed={3}
          colorShift={true}
          colorSpeed={12}
          className="text-4xl font-bold md:text-5xl lg:text-6xl"
        />
      </h1>
      
      <div className="z-10 w-full max-w-2xl">
        <TranscriptionSection />
      </div>
      
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        © 2025 Tercel
      </footer>
    </main>
  )
}
