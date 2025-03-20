import { Particles } from "@/components/ui/particles"
import TranscriptionSection from "@/components/transcription-section"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <Particles className="absolute inset-0" quantity={100} ease={50} />
      
      <h1 className="relative z-10 mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Tercel
        </span>
        <span className="ml-2 font-light">Транскрипция</span>
      </h1>
      
      <div className="z-10 w-full max-w-2xl">
        <TranscriptionSection />
      </div>
      
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      
      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        © 2023 Tercel. Все права защищены.
      </footer>
    </main>
  )
}
