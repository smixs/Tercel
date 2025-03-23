"use client"

import { useState } from "react"
import { FileText, Headphones, AlertCircle, ClipboardCopy, Download } from "lucide-react"

import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface TranscriptionResult {
  text: string | Record<string, unknown>
  format: "srt" | "json" | "text" | "vtt"
}

interface TranscriptionSectionProps {
  onTranscriptionStart?: () => void
  onTranscriptionEnd?: () => void
}

export default function TranscriptionSection({ 
  onTranscriptionStart, 
  onTranscriptionEnd 
}: TranscriptionSectionProps) {
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [, setIsProcessing] = useState(false)
  const [selectedFormat] = useState<"srt" | "json" | "text" | "vtt">("text")
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)

  const handleFileDrop = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)
      
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      console.log('API ключ доступен:', !!apiKey)
      
      if (!apiKey) {
        throw new Error("API ключ не настроен. Проверьте файл .env.local")
      }
      
      onTranscriptionStart?.()
      
      // Создаем FormData для прямой отправки в Fireworks
      const formData = new FormData()
      formData.append("file", file)
      formData.append("vad_model", "silero")
      formData.append("alignment_model", "tdnn_ffn")
      formData.append("preprocessing", "dynamic")
      formData.append("temperature", "0")
      formData.append("timestamp_granularities", "segment")
      formData.append("response_format", "text")
      
      console.log(`Отправка файла ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} МБ) в Fireworks API`)
      
      const response = await fetch("https://audio-prod.us-virginia-1.direct.fireworks.ai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          // Не добавляем Content-Type, так как браузер сам добавит правильный boundary для multipart/form-data
        },
        body: formData,
      })
      
      // Получаем ответ как текст
      const responseText = await response.text()
      
      if (!response.ok) {
        // Пробуем распарсить ошибку как JSON
        try {
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.error?.message || `Ошибка API Fireworks: ${response.status}`)
        } catch (e) {
          throw new Error(responseText || `Ошибка API Fireworks: ${response.status}`)
        }
      }
      
      // Пробуем распарсить как JSON если возможно
      let data = responseText
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        // Если не JSON, используем как текст
        console.log("Ответ не является JSON, используем как текст")
      }
      
      setResult({
        text: data,
        format: "text"
      })
      
      // Переключаемся на вкладку результатов
      setActiveTab("result")
      
      return Promise.resolve()
    } catch (error: unknown) {
      console.error("Ошибка обработки файла:", error)
      setError(error instanceof Error ? error.message : "Ошибка при транскрибировании")
      return Promise.reject(error)
    } finally {
      setIsProcessing(false)
      onTranscriptionEnd?.()
    }
  }

  const handleDownload = () => {
    if (!result) return
    
    const content = typeof result.text === 'object' 
      ? JSON.stringify(result.text, null, 2) 
      : result.text
      
    const blob = new Blob([content], { 
      type: result.format === 'json' 
        ? 'application/json' 
        : 'text/plain' 
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcription.${result.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!result) return
    
    const content = typeof result.text === 'object' 
      ? JSON.stringify(result.text, null, 2) 
      : result.text
      
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Текст скопирован в буфер обмена')
      })
      .catch(err => {
        console.error('Не удалось скопировать текст: ', err)
      })
  }

  const formatResultText = (text: string | Record<string, unknown>, format: string): string => {
    if (format === 'json') {
      return typeof text === 'object' 
        ? JSON.stringify(text, null, 2)
        : text
    }
    return text as string
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            <span>Загрузка</span>
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-2" disabled={!result}>
            <FileText className="h-4 w-4" />
            <span>Результат</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-4">
          <div className="space-y-4">
            <div className="col-span-4 w-full">
              <Dropzone 
                onFileDrop={handleFileDrop}
                className="h-full" 
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="result" className="mt-4">
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Результат транскрибирования</CardTitle>
                <CardDescription>
                  Формат: TEXT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="min-h-[200px] max-h-[500px] md:max-h-[600px] h-auto overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-4 text-sm transition-all">
                  {formatResultText(result.text, result.format)}
                </pre>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Скачать
                </Button>
                <Button onClick={handleCopy} variant="outline">
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Копировать
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 