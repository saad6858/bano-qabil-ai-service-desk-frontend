import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * The browser talks only to this route.
 * The n8n production webhook remains server-side in Vercel.
 */
export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "The AI service is not configured yet. Set N8N_WEBHOOK_URL in Vercel." },
      { status: 500 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const rawBody = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: "The AI service returned an error.",
          upstreamStatus: upstreamResponse.status,
          details: rawBody.slice(0, 1000),
        },
        { status: 502 },
      );
    }

    if (contentType.includes("application/json")) {
      try {
        const data: unknown = JSON.parse(rawBody);
        return NextResponse.json({ response: extractResponseText(data) });
      } catch {
        // Fall through to plain-text response handling.
      }
    }

    return NextResponse.json({
      response: rawBody || "The service returned an empty response.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";

    return NextResponse.json(
      { error: "Unable to reach the AI service.", details: message },
      { status: 502 },
    );
  }
}

function extractResponseText(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const extracted = extractResponseText(item);
      if (extracted) return extracted;
    }
    return "";
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferredKeys = ["response", "answer", "output", "text", "message", "result"];

    for (const key of preferredKeys) {
      const candidate = record[key];

      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }

      if (candidate && typeof candidate === "object") {
        const nested = extractResponseText(candidate);
        if (nested) return nested;
      }
    }
  }

  return JSON.stringify(value, null, 2);
}