# Bano Qabil AI Service Desk — Frontend

A dedicated Next.js frontend for the **Bano Qabil AI Service Desk** final project.

This repository is intentionally separate from the existing Python/n8n backend repository.

## Architecture

```text
Browser
  ↓
Next.js 16 App Router
  ↓
/api/chat (server-side route)
  ↓
N8N_WEBHOOK_URL
  ↓
n8n Main Manager / Service Desk
  ↓
Specialist agents and tools
```

The browser never receives the production n8n webhook URL. The `/api/chat` route reads `N8N_WEBHOOK_URL` on the server and forwards the request to n8n.

## Current stack

- Next.js 16.3.6
- React 19.3.0
- Tailwind CSS 4.3.3
- TypeScript 7.0.2
- Lucide React 1.48.0
- Vercel-ready App Router API route

The versions were checked against the current package/docs sources on 26 September 2026. Next.js 16 requires Node.js 20.9+; the included package file records that requirement.

## Setup

1. Upload the files in this repository to the GitHub repository.
2. Import the repository into Vercel.
3. In Vercel → Project Settings → Environment Variables, add:

```text
N8N_WEBHOOK_URL=https://YOUR-N8N-HOST/webhook/YOUR-PRODUCTION-WEBHOOK
```

4. Redeploy.

For local development, copy `.env.example` to `.env.local` and set the same variable.

## Request sent to n8n

The frontend sends:

```json
{
  "question": "What courses does Bano Qabil offer?",
  "channel": "web",
  "session_id": "browser-session-id",
  "email": "",
  "cnic": "",
  "otp": ""
}
```

The fields are intentionally compatible with the service-desk request shape planned for the n8n backend. Student verification details should be handled by the private verification flow rather than embedded into public RAG data.

## Design direction

The UI is designed as a Bano Qabil-branded service layer rather than a generic ChatGPT clone. It follows the current public site's visible information architecture and blue/green brand direction: navigation, courses, campuses, registration, application support, and a large service-oriented hero. The exact CSS/animation implementation of the official site was not copied because those internal implementation details are not exposed by the public HTML sources.

The frontend uses lightweight CSS reveal/hover motion and a reduced-motion fallback rather than depending on an animation library for the core experience.

## Security

Do not commit:

- API keys
- n8n private credentials
- `.env` files
- Supabase service-role credentials
- Google/Gmail credentials
- student private records
