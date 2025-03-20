"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Check, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type FileStatus = "idle" | "uploading" | "success" | "error"

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
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Добавляем эффект для установки mounted при монтировании на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setStatus("uploading")
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      try {
        await onFileDrop(selectedFile)
        setProgress(100)
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
  const isSuccess = status === "success"
  const isError = status === "error"

  const getStatusColor = () => {
    if (isDragReject || isError) return "border-red-500 bg-red-500/10"
    if (isDragActive) return "border-primary/70 bg-primary/20"
    if (isUploading) return "border-yellow-500/70 bg-yellow-500/20"
    if (isSuccess) return "border-green-500/70 bg-green-500/20"

    // Только применяем стили зависящие от темы, когда компонент смонтирован
    if (!mounted) return "border-zinc-200 bg-white/80" // Дефолтный стиль для SSR
    
    return resolvedTheme === "dark" 
      ? "border-zinc-800 hover:border-primary/50 bg-zinc-800/50 hover:bg-zinc-800/70" 
      : "border-zinc-200 hover:border-primary/50 bg-white/80 hover:bg-white/90"
  }

  const getGlowColor = () => {
    if (isDragReject || isError) return "shadow-[0_0_15px_rgba(239,68,68,0.5)]"
    if (isDragActive) return "shadow-[0_0_15px_rgba(147,51,234,0.5)]"
    if (isUploading) return "shadow-[0_0_15px_rgba(234,179,8,0.5)]"
    if (isSuccess) return "shadow-[0_0_15px_rgba(34,197,94,0.5)]"
    return ""
  }

  // Функция для форматирования размера файла
  const formatFileSize = (size?: number) => {
    if (size === undefined) return "Неизвестный размер"
    return `${(size / (1024 * 1024)).toFixed(2)} МБ`
  }

  return (
    <Card
      className={cn(
        "relative w-full max-w-2xl overflow-hidden transition-all duration-300",
        getGlowColor(),
        className
      )}
    >
      <CardContent className="p-0">
        <div
          {...getRootProps({
            className: cn(
              "flex h-60 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 transition-all duration-200",
              getStatusColor()
            ),
          })}
        >
          <input {...getInputProps()} />

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/30 backdrop-blur-md">
            {isUploading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
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

            {isSuccess && (
              <>
                <p className="text-lg font-medium">Файл успешно загружен!</p>
                <p className="text-sm text-muted-foreground">
                  {file?.name} ({formatFileSize(file?.size)})
                </p>
              </>
            )}

            {isError && (
              <>
                <p className="text-lg font-medium">Ошибка загрузки</p>
                <p className="text-sm text-muted-foreground">
                  Пожалуйста, попробуйте ещё раз
                </p>
              </>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="px-6 py-3">
            <Progress value={progress} className="h-2 w-full" />
            <p className="mt-2 text-xs text-muted-foreground">
              Обработка: {progress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 