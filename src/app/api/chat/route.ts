import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Browser -> this server route -> n8n.
 * Keeping the n8n URL server-side prevents the production webhook URL
 * from being exposed in the browser bundle.
 */
export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "The AI service is not configured yet." },
      { status: 500 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const rawBody = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "";

    if (!upstream.ok) {
      // Do not expose raw n8n errors, execution traces, or upstream details to the user.
      return NextResponse.json(
        { error: "The AI service returned an error." },
        { status: 502 },
      );
    }

    if (contentType.includes("application/json")) {
      try {
        const data: unknown = JSON.parse(rawBody);
        return NextResponse.json({ response: extractResponseText(data) });
      } catch {
        // The upstream declared JSON but returned invalid JSON; use the raw text below.
      }
    }

    return NextResponse.json({
      response: rawBody.trim() || "The service returned an empty response.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the AI service." },
      { status: 502 },
    );
  }
}

function extractResponseText(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = extractResponseText(item);
      if (result.trim()) return result;
    }
    return "";
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferredKeys = ["response", "answer", "output", "text", "message", "result"];

    for (const key of preferredKeys) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
      if (candidate && typeof candidate === "object") {
        const nested = extractResponseText(candidate);
        if (nested.trim()) return nested;
      }
    }
  }

  return "";
}
