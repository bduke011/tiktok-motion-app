# AI Creator Studio - Features Documentation

## Overview

AI Creator Studio combines two powerful AI tools: TikTok Motion Creator for viral video generation and Avatar Creator for unique AI-generated avatars. Both powered by fal.ai APIs.

---

## Core Features

### 1. TikTok Motion Creator

**Route:** `/` (main page)

Create viral TikTok videos using AI-powered motion control. Upload a character image and a reference video - the AI animates your character to match the motion.

**Capabilities:**
- Upload character image (JPG, PNG, WEBP)
- Upload motion reference video (MP4, MOV, WEBM)
- Optional text prompt for additional context
- Character orientation options:
  - **Match Image Pose** - Keeps original pose (max 10s)
  - **Match Video Motion** - Full motion transfer (max 30s)
- Real-time progress tracking with queue position
- Inline video preview
- One-click download

**AI Model:** fal.ai Kling Video v2.6 Motion Control

### 2. Avatar Creator

**Route:** `/avatar`

Create unique AI avatars from text or transform existing photos.

**Two Modes:**

| Mode | Description |
|------|-------------|
| **Create** | Generate avatars purely from text prompts |
| **Edit** | Upload a photo and describe the transformation |

**Capabilities:**
- Text-to-avatar generation
- Photo transformation/editing
- Quick prompt suggestions for inspiration
- 2K resolution output (2048 x 2048)
- One-click download

**AI Model:** fal.ai nano-banana-pro

### 3. Avatar Gallery

**Route:** `/avatar/gallery`

View and manage your avatar generation history.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Frontend | React 19 |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | NextAuth v4 |
| AI APIs | fal.ai (Kling Video, nano-banana-pro) |
| Workflow | n8n (webhook automation) |
| Language | TypeScript |

---

## Database Schema

**Database:** PostgreSQL (Neon)

### Models

#### User
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (cuid) |
| email | String | Unique email address |
| passwordHash | String | Bcrypt hashed password |
| name | String | Optional display name |
| image | String | Optional profile image URL |
| provider | String | Auth provider (default: "credentials") |
| createdAt | DateTime | Account creation timestamp |

#### AvatarGeneration
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| userId | String | Reference to User |
| mode | String | "create" or "edit" |
| prompt | String | Text prompt used |
| sourceImageUrl | String | Source image (edit mode) |
| createdAt | DateTime | Generation timestamp |

#### AvatarImage
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| avatarGenerationId | String | Reference to AvatarGeneration |
| url | String | Generated avatar URL |
| createdAt | DateTime | Creation timestamp |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/[...nextauth]` | * | NextAuth authentication handlers |
| `/api/avatar` | POST | Generate avatar images |
| `/api/fal/proxy` | * | fal.ai proxy for file uploads |

---

## Environment Variables

### Current TikTok App Variables
```env
# n8n Webhooks
NEXT_PUBLIC_N8N_SUBMIT_URL=https://duke011.app.n8n.cloud/webhook/tiktok-motion/submit
NEXT_PUBLIC_N8N_STATUS_URL=https://duke011.app.n8n.cloud/webhook/tiktok-motion/status

# fal.ai
FAL_KEY=your_fal_api_key_here
```

### Variables to Add (from Photo-Shoot App)
```env
# fal.ai API Key (use this one - it's configured)
FAL_API_KEY=a193ac4d-f13f-42dc-a551-92c0eed50297:c7f7df14555e82f283c32f683529ba56

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_WRzuHp26ihGw@ep-square-mouse-ahr32nrs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_SECRET=photo-shoot-app-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# n8n Webhook (for photo features if needed)
N8N_WEBHOOK_URL=https://duke011.app.n8n.cloud/webhook/photo-shoot
```

### Combined .env.local Template
```env
# ===================
# n8n Webhooks
# ===================
NEXT_PUBLIC_N8N_SUBMIT_URL=https://duke011.app.n8n.cloud/webhook/tiktok-motion/submit
NEXT_PUBLIC_N8N_STATUS_URL=https://duke011.app.n8n.cloud/webhook/tiktok-motion/status
N8N_WEBHOOK_URL=https://duke011.app.n8n.cloud/webhook/photo-shoot

# ===================
# fal.ai
# ===================
FAL_KEY=a193ac4d-f13f-42dc-a551-92c0eed50297:c7f7df14555e82f283c32f683529ba56
FAL_API_KEY=a193ac4d-f13f-42dc-a551-92c0eed50297:c7f7df14555e82f283c32f683529ba56

# ===================
# Database (Neon PostgreSQL)
# ===================
DATABASE_URL=postgresql://neondb_owner:npg_WRzuHp26ihGw@ep-square-mouse-ahr32nrs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# ===================
# NextAuth
# ===================
NEXTAUTH_SECRET=photo-shoot-app-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

---

## Route Structure

```
/                       # TikTok Motion Creator (main)
/login                  # Login page
/register               # Registration page
/avatar                 # Avatar Creator
/avatar/gallery         # Avatar history
```

---

## UI/UX Features

- Dark theme with gradient accents
- Fully responsive design (mobile-friendly)
- Drag & drop file upload
- Real-time progress tracking with queue position
- Loading states with spinners
- Error handling with user feedback
- Inline video/image preview
- One-click download for results

---

## Deployment

Deploy to Vercel:
1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Future changes auto-deploy via GitHub push

---

## n8n Integration

| Webhook | Purpose |
|---------|---------|
| `/webhook/tiktok-motion/submit` | Submit video generation jobs |
| `/webhook/tiktok-motion/status` | Check job status/queue position |
| `/webhook/photo-shoot` | Photo shoot generation (if integrated) |

**n8n Instance:** https://duke011.app.n8n.cloud
