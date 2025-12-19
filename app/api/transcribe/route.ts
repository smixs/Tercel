import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes for large audio files

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error('API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://audio-prod.us-virginia-1.direct.fireworks.ai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fireworks API error:', response.status, errorText);
      return NextResponse.json(
        { error: errorText || `Fireworks API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Transcription API is running' });
} 