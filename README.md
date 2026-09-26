# Bano Qabil AI Service Desk — Frontend v2

A focused, single-screen frontend for the Bano Qabil AI Service Desk.

## UX direction

The frontend is intentionally **not a long marketing page**. The primary task is the service-desk conversation:

```text
User opens page
    ↓
Sees one clear AI service desk
    ↓
Chooses a quick request or types a question
    ↓
Chat request goes to /api/chat
    ↓
Server-side route forwards it to n8n
```

There are no student-registration redirects or unrelated navigation links in the interface.

## Architecture

```text
Browser
  ↓
Next.js /api/chat
  ↓
N8N_WEBHOOK_URL (server-only)
  ↓
n8n Main Manager
```

## Environment variable

Set this in Vercel:

```text
N8N_WEBHOOK_URL=https://YOUR-N8N-HOST/webhook/YOUR-PRODUCTION-WEBHOOK
```

Do not expose the n8n webhook through a `NEXT_PUBLIC_...` variable.

## Request shape

```json
{
  "question": "What courses are available?",
  "channel": "web",
  "session_id": "browser-session-id",
  "email": "",
  "cnic": "",
  "otp": ""
}
```
