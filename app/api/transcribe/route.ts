import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export const maxDuration = 300; // 5 minutes for large audio files

export async function POST(request: NextRequest) {
  let blobUrl: string | null = null;

  try {
    const body = await request.json();
    blobUrl = body.blobUrl;

    if (!blobUrl) {
      return NextResponse.json(
        { error: 'blobUrl is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error('API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Sending blob URL to Fireworks API:', blobUrl);

    // Create FormData with URL instead of file
    const formData = new FormData();
    formData.append('file', blobUrl);
    formData.append('vad_model', 'silero');
    formData.append('alignment_model', 'tdnn_ffn');
    formData.append('preprocessing', 'dynamic');
    formData.append('temperature', '0');
    formData.append('timestamp_granularities', 'word,segment');
    formData.append('response_format', 'verbose_json');

    const response = await fetch(
      'https://audio-prod.api.fireworks.ai/v1/audio/transcriptions',
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

      // Still try to delete the blob even on error
      if (blobUrl) {
        try {
          await del(blobUrl);
          console.log('Blob deleted after error:', blobUrl);
        } catch (deleteError) {
          console.error('Failed to delete blob:', deleteError);
        }
      }

      return NextResponse.json(
        { error: errorText || `Fireworks API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Transcription completed successfully');

    // Delete the blob after successful transcription
    try {
      await del(blobUrl);
      console.log('Blob deleted successfully:', blobUrl);
    } catch (deleteError) {
      console.error('Failed to delete blob:', deleteError);
      // Don't fail the request if deletion fails
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Transcription error:', error);

    // Try to clean up blob on any error
    if (blobUrl) {
      try {
        await del(blobUrl);
      } catch (deleteError) {
        console.error('Failed to delete blob on error:', deleteError);
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Transcription API is running' });
}
