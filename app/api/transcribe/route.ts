import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // TODO: Implement transcription logic
    return NextResponse.json({ message: 'Transcription endpoint' });
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