# TikTok Motion Creator

Create viral TikTok videos with AI-powered motion control. Upload a character image and a reference video - the AI will animate your character to match the motion!

## Features

- Drag & drop file upload
- Real-time progress tracking
- Inline video preview
- One-click download

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- fal.ai (Kling Video v2.6 Motion Control)
- n8n (workflow automation)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your fal.ai API key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_N8N_SUBMIT_URL` - n8n webhook URL for submitting jobs
- `NEXT_PUBLIC_N8N_STATUS_URL` - n8n webhook URL for checking status
- `FAL_KEY` - Your fal.ai API key

## Deployment

Deploy to Vercel and configure the environment variables in the Vercel dashboard.
