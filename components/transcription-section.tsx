"use client"

import { useState } from "react"
import { FileText, Headphones, AlertCircle } from "lucide-react"

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
  text: string | any // для поддержки как текста, так и JSON объекта
  format: "srt" | "json" | "text" | "vtt"
}

export default function TranscriptionSection() {
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<"srt" | "json" | "text" | "vtt">("text")
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)

  const handleFileDrop = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)
      
      // Формируем данные для отправки на сервер
      const formData = new FormData()
      formData.append("file", file)
      formData.append("format", selectedFormat)
      
      console.log(`Отправка файла ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} МБ), формат: ${selectedFormat}`)
      
      // Отправляем запрос на API
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Ошибка сервера: ${response.status}`)
      }
      
      if (data.success) {
        setResult({
          text: data.text,
          format: data.format
        })
        
        // Автоматически переключаемся на вкладку результатов
        setActiveTab("result")
        
        return Promise.resolve()
      } else {
        throw new Error(data.error || "Неизвестная ошибка")
      }
    } catch (error: any) {
      console.error("Ошибка обработки файла:", error)
      setError(error.message || "Ошибка при транскрибировании")
      return Promise.reject(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format as "srt" | "json" | "text" | "vtt")
  }

  const handleDownload = () => {
    if (!result) return
    
    let content = typeof result.text === 'object' 
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

  const formatResultText = (text: any, format: string) => {
    if (format === 'json') {
      return typeof text === 'object' 
        ? JSON.stringify(text, null, 2)
        : text
    }
    return text
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
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4 md:col-span-1">
                <p className="mb-2 text-sm font-medium">Формат вывода:</p>
                <div className="flex flex-row flex-wrap gap-2 md:flex-col">
                  {["text", "srt", "vtt", "json"].map((format) => (
                    <Button
                      key={format}
                      variant={selectedFormat === format ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFormatChange(format)}
                      className="flex-1 md:flex-none"
                      disabled={isProcessing}
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="col-span-4 md:col-span-3">
                <Dropzone 
                  onFileDrop={handleFileDrop} 
                  className="h-full" 
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="result" className="mt-4">
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Результат транскрибирования</CardTitle>
                <CardDescription>
                  Формат: {result.format.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="h-60 overflow-auto rounded-md bg-muted p-4 text-sm">
                  {formatResultText(result.text, result.format)}
                </pre>
              </CardContent>
              <CardFooter>
                <Button onClick={handleDownload}>Скачать</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 