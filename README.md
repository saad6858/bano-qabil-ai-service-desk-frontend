# Bano Qabil AI Service Desk — Frontend v3

A focused chat-first frontend for the Bano Qabil AI Service Desk.

## Design direction

This version moves away from the previous pale, split-screen layout and uses a dark navy + teal/green visual language closer to the current Bano Qabil site direction visible in the supplied reference screenshots.

The interface is intentionally a real service-desk chat rather than a marketing page:

- One centered chat workspace
- Mobile-first responsive layout
- No registration redirects
- No unrelated official-site buttons
- Compact Bano Qabil-inspired logo mark
- Quick request cards for common service-desk tasks
- Persistent chat/session state across browser refreshes
- New conversation control
- Plain-text response cleanup for common Markdown leakage
- Server-side n8n webhook proxy

## Architecture

```text
Browser
  ↓
Next.js App Router
  ↓
/api/chat (server-side)
  ↓
N8N_WEBHOOK_URL
  ↓
n8n Main Manager / Service Desk
  ↓
Specialist agents + tools
```

The production n8n webhook URL remains server-side and is never stored in a `NEXT_PUBLIC_...` environment variable.

## Environment variable

Create a Vercel environment variable:

```text
N8N_WEBHOOK_URL=https://YOUR-N8N-HOST/webhook/YOUR-PRODUCTION-WEBHOOK
```

For local development:

```text
cp .env.example .env.local
```

then set the webhook URL in `.env.local`.

## Request body sent to n8n

```json
{
  "question": "What courses are currently offered by Bano Qabil?",
  "channel": "web",
  "session_id": "browser-session-id",
  "email": "",
  "cnic": "",
  "otp": ""
}
```

## Run locally

Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Production build check:

```bash
npm run typecheck
npm run build
```

## Privacy / security

Do not commit API keys, n8n credentials, OAuth secrets, private student records, or `.env` files.

The browser-side chat persistence masks common CNIC/OTP-like numeric values before saving message history to local storage. The production student verification system should still keep private data behind the backend verification flow.
