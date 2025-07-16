# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for audio transcription, branded as "ZAPIS" (formerly Tercel). It provides a web interface for uploading audio files and transcribing them using the Fireworks AI API.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture and Key Implementation Details

### Tech Stack
- **Next.js 15.2.3** with App Router
- **React 19** with TypeScript
- **TailwindCSS v4** with custom Space Grotesk font
- **Shadcn/UI components** with Radix UI primitives
- **Framer Motion** for animations
- **OGL** for WebGL particle effects
- **React Dropzone** for file handling

### API Integration
The application currently makes **client-side calls** to the Fireworks AI API using XMLHttpRequest with progress tracking. The API key is exposed via `NEXT_PUBLIC_API_KEY` environment variable. 

**Fireworks API Configuration:**
- Endpoint: `https://audio-prod.us-virginia-1.direct.fireworks.ai/v1/audio/transcriptions`
- Parameters:
  - `vad_model`: "silero"
  - `alignment_model`: "tdnn_ffn" 
  - `preprocessing`: "dynamic"
  - `temperature`: "0"
  - `timestamp_granularities`: "word,segment"
  - `response_format`: "verbose_json"

**Timestamp Support:**
- Uses `verbose_json` format to receive detailed timing information
- Supports both word-level and segment-level timestamps
- User can toggle between plain text and timestamped text display
- Timestamps formatted as `[MM:SS.s - MM:SS.s] text segment`

**Important**: The server-side API route at `/app/api/transcribe/route.ts` exists but is not implemented (contains only TODO).

### Application Flow and State Management

The app uses a multi-stage transcription process with visual feedback:

1. **Upload Stage**: File selection with drag-and-drop support via react-dropzone
2. **Processing Stages**: Upload → Transcode → VAD → Transcribe with progress tracking
3. **Results Display**: Text output with copy/download functionality

**State Architecture:**
- Main page (`app/page.tsx`) manages global animation state (particle speed changes during transcription)
- TranscriptionSection component handles all transcription logic and file processing
- Tab-based UI switches between upload and results views

### Core Components

**Main Layout (`app/page.tsx`):**
- WebGL particle background using OGL library (`particles-ogl.tsx`)
- Animated "ZAPIS" text with morphing effect (`gooey-text.tsx`)
- Infinity symbol particle effect (`infinity-effect.tsx`)
- Responsive layout with state-driven particle animations

**Transcription Logic (`components/transcription-section.tsx`):**
- XMLHttpRequest-based file upload with progress tracking
- Multi-stage process simulation (since API doesn't provide granular progress)
- **Timestamp Support**: Toggle between plain text and timestamped output
- Processes `verbose_json` API responses with segment/word timing data
- File download and clipboard copy functionality (supports both formats)
- Tab interface for upload/results switching
- **New TypeScript interfaces**: `VerboseTranscriptionResponse`, `TranscriptionSegment`, `TranscriptionWord`

**UI Components (`components/ui/`):**
- Custom Dropzone with drag-and-drop, progress bars, and stage indicators
- Particle Button with success animations
- Shadcn/UI components extended with custom animations

### Animation System

The app features a sophisticated animation system:
- **Particle effects**: OGL-based WebGL particles that respond to transcription state
- **Text morphing**: Smooth transitions between "Zapis", "For", "Your", "Information"
- **Interactive particles**: Mouse-responsive particle movements
- **Progress animations**: Multi-stage progress tracking with visual feedback

### Environment Variables
Required for deployment:
- `NEXT_PUBLIC_API_KEY`: Fireworks AI API key (exposed to client)

### Deployment
The project is configured for Vercel deployment with:
- Framework: Next.js
- Region: Frankfurt (fra1)
- See `VERCEL_SETUP.md` for detailed deployment instructions

### File Processing Details

**Supported file types**: Audio files via react-dropzone
**Upload handling**: 
- Uses XMLHttpRequest for progress tracking (not fetch API)
- FormData construction with all required Fireworks parameters
- Error handling covers network errors, API errors, and malformed responses

### Timestamp Functionality

**Display Modes:**
- **Plain Text**: Shows transcription without timing information
- **Timestamped Text**: Shows segments with `[MM:SS.s - MM:SS.s] text` format

**Implementation:**
- `formatTextWithTimestamps()`: Converts verbose_json segments to readable format
- `formatTimestamp()`: Converts seconds to MM:SS.s display format
- Toggle button in results UI switches between display modes
- Copy/download functions respect current display mode
- Files downloaded with timestamps include `_with_timestamps` suffix

### Design Principles
The codebase follows DRY, KISS, and YAGNI principles. Comments are in Russian, indicating a Russian-speaking development team.