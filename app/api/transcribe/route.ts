import { NextRequest, NextResponse } from "next/server"

const API_KEY = "fw_3ZeGXXJSZkPNHQnLomqkcgp4"
const API_URL = "https://audio-prod.us-virginia-1.direct.fireworks.ai/v1/audio/transcriptions"

export async function POST(request: NextRequest) {
  try {
    console.log("Получен запрос на транскрибирование")
    
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const format = "text" // Всегда используем текстовый формат
    
    if (!file) {
      console.error("Файл не предоставлен")
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      )
    }
    
    console.log(`Отправка файла ${file.name} (${file.size} байт) в Fireworks API, формат: ${format}`)
    
    // Создаем новый FormData для отправки в Fireworks API
    const fireworksFormData = new FormData()
    fireworksFormData.append("file", file)
    fireworksFormData.append("vad_model", "silero")
    fireworksFormData.append("alignment_model", "tdnn_ffn")
    fireworksFormData.append("preprocessing", "dynamic")
    fireworksFormData.append("temperature", "0")
    fireworksFormData.append("timestamp_granularities", "segment")
    fireworksFormData.append("response_format", format)
    
    // Отправляем запрос в Fireworks API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        // Не устанавливаем Content-Type, браузер сам добавит boundary для multipart/form-data
      },
      body: fireworksFormData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Ошибка Fireworks API: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `Ошибка API Fireworks: ${response.status}` },
        { status: response.status }
      )
    }
    
    // Для TEXT всегда получаем текстовый ответ
    const result = await response.text()
    
    console.log("Транскрибирование успешно завершено")
    
    return NextResponse.json({
      success: true,
      text: result,
      format
    })
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
} 