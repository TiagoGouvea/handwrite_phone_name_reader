# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application that uses AI (OpenAI GPT-4o) to extract names and phone numbers from handwritten images. The app processes multiple images in batches and allows users to export results as CSV files.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Setup
- Copy `.env.local.example` to `.env.local` and add your OpenAI API key
- The app requires `NEXT_PUBLIC_OPENAI_API_KEY` environment variable

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o with Zod response formatting
- **State**: React hooks (useState)

### Key Components
- **`app/page.tsx`**: Main page with state management for extracted contacts
- **`components/ImageUpload.tsx`**: Handles file uploads, drag & drop, and batch processing (3 images at a time with 300ms delay)
- **`components/ContactResults.tsx`**: Displays results in a table with CSV export functionality  
- **`lib/openai.ts`**: OpenAI integration with structured response parsing using Zod

### Data Flow
1. User uploads multiple images via drag & drop or file input
2. Images are processed in batches of 3 with rate limiting
3. Each image is sent to GPT-4o with structured prompt for name/phone extraction
4. Results are parsed using Zod schema validation
5. Valid contacts are added to the state and displayed in real-time
6. Users can export all results to CSV or clear the list

### Image Processing Details
- Processes images in parallel batches of 3
- 300ms delay between batches to respect API limits
- Uses base64 encoding for image transmission
- Progress tracking with loading states
- Error handling for failed extractions

### Styling Patterns
- Tailwind utility classes throughout
- Responsive design (text-xs sm:text-sm, px-2 sm:px-6)
- Hover states and transitions
- Loading states with spinner animations