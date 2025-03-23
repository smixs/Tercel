"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Check, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type FileStatus = "idle" | "uploading" | "transcribing" | "success" | "error"

interface DropzoneProps {
  onFileDrop: (file: File) => Promise<void>
  className?: string
  currentStage?: string | null
  uploadProgress?: number
  stageMessage?: string
}

export function Dropzone({
  onFileDrop,
  className,
  currentStage,
  uploadProgress = 0,
  stageMessage,
}: DropzoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<FileStatus>("idle")

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setStatus("uploading")

      try {
        await onFileDrop(selectedFile)
        setStatus("success")
      } catch (error) {
        setStatus("error")
        console.error("Error processing file:", error)
      }
    },
    [onFileDrop]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
  })

  const isIdle = status === "idle"
  const isUploading = status === "uploading"
  const isTranscribing = status === "transcribing"
  const isSuccess = status === "success"
  const isError = status === "error"

  // Функция для получения класса свечения рамки в зависимости от состояния
  const getGlowClass = () => {
    if (isDragReject || isError) return "animate-border-error"
    if (isDragActive) return "animate-border-drag"
    if (isUploading) return "animate-border-upload"
    if (isTranscribing) return "animate-border-pulse"
    if (isSuccess) return "animate-border-success"
    return "animate-border-pulse"
  }

  // Функция для форматирования размера файла
  const formatFileSize = (size?: number) => {
    if (size === undefined) return "Неизвестный размер"
    return `${(size / (1024 * 1024)).toFixed(2)} МБ`
  }

  // Функция для отображения сообщения о текущем этапе
  const getStatusMessage = () => {
    if (isError) return "Ошибка обработки"
    if (isSuccess) return "Транскрибирование завершено!"
    if (currentStage && stageMessage) return stageMessage
    if (isIdle) return " "
    return "Обработка..."
  }

  return (
    <Card
      className={cn(
        "relative w-full max-w-2xl overflow-visible transition-all duration-300 bg-transparent border-none",
        className
      )}
    >
      <CardContent className="p-0">
        {/* Контейнер с видимым overflow для свечения */}
        <div className="relative overflow-visible">
          {/* Дропзона с рамкой */}
          <div
            {...getRootProps({
              className: cn(
                "flex h-60 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-transparent p-6 transition-all duration-200 bg-transparent relative",
                getGlowClass()
              ),
            })}
          >
            <input {...getInputProps()} />

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/30 bg-transparent">
              {isUploading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
              {isTranscribing && <Loader2 className="h-8 w-8 animate-spin text-amber-500" />}
              {isSuccess && <Check className="h-8 w-8 text-green-500" />}
              {isError && <Upload className="h-8 w-8 text-red-500" />}
              {isIdle && <Upload className="h-8 w-8 text-primary" />}
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-lg font-medium">
                {getStatusMessage()}
              </p>
              {file && (
                <p className="text-sm text-muted-foreground">
                  {file.name} ({formatFileSize(file.size)})
                </p>
              )}
              {!file && !isError && (
                <p className="text-sm text-muted-foreground">
                  MP3, WAV, AAC, FLAC, OGG, M4A
                </p>
              )}
            </div>
          </div>
        </div>

        {(isUploading || currentStage) && (
          <div className="px-6 py-3">
            <Progress 
              value={uploadProgress} 
              className="h-2 w-full"
              stage={currentStage?.toLowerCase() as "upload" | "transcode" | "vad" | "transcribe"}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {currentStage === "UPLOAD" ? `Загрузка: ${Math.round(uploadProgress)}%` : stageMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}