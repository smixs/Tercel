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
}

export function Dropzone({
  onFileDrop,
  className,
}: DropzoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<FileStatus>("idle")
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setStatus("uploading")
      
      // Загрузка файла с прогрессом от 0% до 100%
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            // После полной загрузки переходим в состояние транскрибирования
            setStatus("transcribing")
            return 100
          }
          return Math.min(prev + 5, 100)
        })
      }, 150)

      try {
        await onFileDrop(selectedFile)
        // Не меняем статус здесь, т.к. он уже будет "transcribing"
        setStatus("success")
      } catch (error) {
        setStatus("error")
        console.error("Error processing file:", error)
      } finally {
        clearInterval(interval)
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
              {isIdle && (
                <>
                  <p className="text-lg font-medium">
                    Перетащите аудиофайл сюда или нажмите для выбора
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MP3, WAV, AAC, FLAC, OGG, M4A
                  </p>
                </>
              )}

              {isUploading && (
                <>
                  <p className="text-lg font-medium">Загрузка файла...</p>
                  <p className="text-sm text-muted-foreground">
                    {file?.name} ({formatFileSize(file?.size)})
                  </p>
                </>
              )}

              {isTranscribing && (
                <p className="text-lg font-medium">Идет транскрибирование...</p>
              )}

              {isSuccess && (
                <>
                  <p className="text-lg font-medium">Транскрибирование завершено!</p>
                  <p className="text-sm text-muted-foreground">
                    {file?.name} ({formatFileSize(file?.size)})
                  </p>
                </>
              )}

              {isError && (
                <>
                  <p className="text-lg font-medium">Ошибка обработки</p>
                  <p className="text-sm text-muted-foreground">
                    Пожалуйста, попробуйте ещё раз
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="px-6 py-3">
            <Progress value={progress} className="h-2 w-full" />
            <p className="mt-2 text-xs text-muted-foreground">
              Загрузка: {progress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}