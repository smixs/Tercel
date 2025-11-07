"use client"

import { useState, useEffect } from "react"
import { FileText, Headphones, AlertCircle, ClipboardCopy, Download, Clock } from "lucide-react"
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

interface TranscriptionWord {
  word: string
  start: number
  end: number
  language?: string
  probability?: number
  hallucination_score?: number
  speaker_id?: string
}

interface TranscriptionSegment {
  id: number
  text: string
  start: number
  end: number
  speaker_id?: string
  words?: TranscriptionWord[]
}

interface VerboseTranscriptionResponse {
  text: string
  task: string
  language: string
  duration: number
  segments: TranscriptionSegment[]
  words?: TranscriptionWord[]
}

interface TranscriptionResult {
  text: string | VerboseTranscriptionResponse
  format: "text" | "verbose_json"
}

interface TranscriptionSectionProps {
  onTranscriptionStart?: () => void
  onTranscriptionEnd?: () => void
  onResultChange?: (hasResult: boolean) => void
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
  onTranscriptionEnd,
  onResultChange 
}: TranscriptionSectionProps) {
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<keyof typeof TRANSCRIPTION_STAGES | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showTimestamps, setShowTimestamps] = useState(false)

  // Уведомляем родительский компонент об изменении результата
  useEffect(() => {
    onResultChange?.(!!result)
  }, [result, onResultChange])

  // Функция для форматирования времени в MM:SS.s формат
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toFixed(1).padStart(4, '0')}`
  }

  // Функция для форматирования текста с временными метками
  const formatTextWithTimestamps = (data: VerboseTranscriptionResponse): string => {
    return data.segments
      .map(segment => `[${formatTimestamp(segment.start)} - ${formatTimestamp(segment.end)}] ${segment.text}`)
      .join('\n')
  }

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
      formData.append("timestamp_granularities", "word,segment")
      formData.append("response_format", "verbose_json")

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
      xhr.open("POST", "https://audio-prod.api.fireworks.ai/v1/audio/transcriptions")
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
      let data: VerboseTranscriptionResponse
      try {
        data = JSON.parse(responseText)
        console.log("Получен verbose_json ответ:", data)
      } catch (e) {
        console.error("Ошибка парсинга JSON ответа:", e)
        throw new Error("Неверный формат ответа от API")
      }
      
      setResult({
        text: data,
        format: "verbose_json"
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
    
    let content: string
    if (result.format === 'verbose_json' && typeof result.text === 'object') {
      // Если включены timestamps, используем форматированный текст
      content = showTimestamps 
        ? formatTextWithTimestamps(result.text as VerboseTranscriptionResponse)
        : (result.text as VerboseTranscriptionResponse).text
    } else {
      content = result.text as string
    }
      
    const blob = new Blob([content], { type: 'text/plain' })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcription${showTimestamps ? '_with_timestamps' : ''}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!result) return
    
    let content: string
    if (result.format === 'verbose_json' && typeof result.text === 'object') {
      // Если включены timestamps, используем форматированный текст
      content = showTimestamps 
        ? formatTextWithTimestamps(result.text as VerboseTranscriptionResponse)
        : (result.text as VerboseTranscriptionResponse).text
    } else {
      content = result.text as string
    }
      
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Текст скопирован в буфер обмена')
      })
      .catch(err => {
        console.error('Не удалось скопировать текст: ', err)
      })
  }

  const formatResultText = (text: string | VerboseTranscriptionResponse, format: string): string => {
    if (format === 'verbose_json' && typeof text === 'object') {
      // Если включены timestamps, показываем форматированный текст
      return showTimestamps 
        ? formatTextWithTimestamps(text as VerboseTranscriptionResponse)
        : (text as VerboseTranscriptionResponse).text
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
                uploadProgress={currentStage === "UPLOAD" ? uploadProgress : calculateTotalProgress()}
                stageMessage={getCurrentStageMessage()}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="result" className="mt-4">
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Результат транскрибирования</CardTitle>
                    <CardDescription>
                      Формат: {showTimestamps ? 'TEXT с временными метками' : 'TEXT'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <label 
                      htmlFor="timestamps-toggle" 
                      className="text-sm font-medium cursor-pointer"
                    >
                      Показать временные метки
                    </label>
                    <Button
                      id="timestamps-toggle"
                      variant={showTimestamps ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTimestamps(!showTimestamps)}
                      className="ml-2"
                    >
                      {showTimestamps ? "Включено" : "Выключено"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="min-h-[20px] max-h-[500px] md:max-h-[600px] h-auto overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-4 text-sm transition-all">
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