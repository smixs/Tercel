"use client"

import { useState } from "react"
import { FileText, Headphones, AlertCircle, ClipboardCopy, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { ParticleButton } from "@/components/ui/particle-button"

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

// Этапы процесса транскрибации
const TRANSCRIPTION_STAGES = {
  UPLOAD: { weight: 0.25, message: "Загрузка файла" },
  TRANSCODE: { weight: 0.15, message: "Транскодирование" },
  VAD: { weight: 0.2, message: "Анализ речи" },
  TRANSCRIBE: { weight: 0.4, message: "Транскрибация" }
}

export default function TranscriptionSection({ 
  onTranscriptionStart, 
  onTranscriptionEnd 
}: TranscriptionSectionProps) {
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFormat] = useState<"srt" | "json" | "text" | "vtt">("text")
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<keyof typeof TRANSCRIPTION_STAGES | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Функция для отправки файла через XMLHttpRequest
  const sendFileWithProgress = (file: File, apiKey: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      
      // Добавляем все необходимые параметры
      formData.append("file", file)
      formData.append("vad_model", "silero")
      formData.append("alignment_model", "tdnn_ffn")
      formData.append("preprocessing", "dynamic")
      formData.append("temperature", "0")
      formData.append("timestamp_granularities", "segment")
      formData.append("response_format", "text")

      // Отслеживаем прогресс загрузки
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadProgress(progress)
        }
      })

      // Обработка завершения запроса
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.error?.message || `Ошибка API Fireworks: ${xhr.status}`))
          } catch {
            reject(new Error(xhr.responseText || `Ошибка API Fireworks: ${xhr.status}`))
          }
        }
      })

      // Обработка ошибок сети
      xhr.addEventListener("error", () => {
        reject(new Error("Ошибка сети при отправке файла"))
      })

      // Настраиваем и отправляем запрос
      xhr.open("POST", "https://audio-prod.us-virginia-1.direct.fireworks.ai/v1/audio/transcriptions")
      xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`)
      xhr.send(formData)
    })
  }

  const handleFileDrop = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)
      setCurrentStage("UPLOAD")
      setUploadProgress(0)
      
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      console.log('API ключ доступен:', !!apiKey)
      
      if (!apiKey) {
        throw new Error("API ключ не настроен. Проверьте файл .env.local")
      }
      
      onTranscriptionStart?.()
      
      console.log(`Отправка файла ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} МБ) в Fireworks API`)
      
      // Этап загрузки
      const responseText = await sendFileWithProgress(file, apiKey)
      
      // Имитируем этапы обработки (т.к. API не предоставляет информацию о них)
      setCurrentStage("TRANSCODE")
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCurrentStage("VAD")
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setCurrentStage("TRANSCRIBE")
      
      // Обрабатываем ответ
      let data = responseText
      try {
        data = JSON.parse(responseText)
      } catch (e) {
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
      setCurrentStage(null)
      setUploadProgress(0)
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

  // Функция для расчета общего прогресса
  const calculateTotalProgress = (): number => {
    if (!currentStage) return 0
    
    let progress = 0
    let stageStartProgress = 0
    
    // Проходим по всем этапам до текущего
    for (const [stage, { weight }] of Object.entries(TRANSCRIPTION_STAGES)) {
      if (stage === currentStage) {
        // Для этапа загрузки используем uploadProgress
        if (stage === "UPLOAD") {
          progress = stageStartProgress + (weight * uploadProgress / 100)
        } else {
          // Для остальных этапов считаем половину прогресса
          progress = stageStartProgress + (weight * 50 / 100)
        }
        break
      }
      stageStartProgress += weight * 100
    }
    
    return progress
  }

  // Получаем сообщение для текущего этапа
  const getCurrentStageMessage = (): string => {
    if (!currentStage) return ""
    return TRANSCRIPTION_STAGES[currentStage].message
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
                currentStage={currentStage}
                uploadProgress={uploadProgress}
                stageMessage={getCurrentStageMessage()}
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
                <ParticleButton onClick={handleDownload} variant="outline" successDuration={400}>
                  <Download className="mr-2 h-4 w-4" />
                  Скачать
                </ParticleButton>
                <ParticleButton onClick={handleCopy} variant="outline" successDuration={400}>
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Копировать
                </ParticleButton>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 