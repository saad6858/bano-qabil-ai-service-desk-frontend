"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  CalendarDays,
  GraduationCap,
  Info,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickActions = [
  {
    label: "Courses",
    prompt: "What courses are available at Bano Qabil?",
    icon: BookOpen,
  },
  {
    label: "Curriculum",
    prompt: "What topics are covered in the Agentic AI course?",
    icon: GraduationCap,
  },
  {
    label: "Schedule",
    prompt: "What is my current class schedule?",
    icon: CalendarDays,
  },
  {
    label: "Application Status",
    prompt: "I want to check my application status.",
    icon: ShieldCheck,
  },
];

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bq-web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Assalam-o-Alaikum! I’m the Bano Qabil AI Service Desk. Ask me about courses, curriculum, schedules, registration, or student support.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("browser-session");
  const [status, setStatus] = useState<"ready" | "thinking" | "error">("ready");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(createSessionId());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>, override?: string) {
    event?.preventDefault();

    const question = (override ?? input).trim();
    if (!question || busy) return;

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: question,
      },
    ]);
    setInput("");
    setBusy(true);
    setStatus("thinking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          channel: "web",
          session_id: sessionId,
          email: "",
          cnic: "",
          otp: "",
        }),
      });

      const data = (await response.json()) as {
        response?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "The AI service returned an error.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content:
            data.response ||
            "I received the request, but the service returned no answer.",
        },
      ]);
      setStatus("ready");
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            error instanceof Error
              ? `I couldn’t reach the AI service. ${error.message}`
              : "I couldn’t reach the AI service. Please try again.",
        },
      ]);
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  function resetChat() {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Assalam-o-Alaikum! I’m the Bano Qabil AI Service Desk. What would you like help with?",
      },
    ]);
    setInput("");
    setStatus("ready");
  }

  const statusLabel =
    status === "thinking"
      ? "Thinking…"
      : status === "error"
        ? "Connection issue"
        : "Ready";

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand" aria-label="Bano Qabil AI Service Desk">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <path
                d="M31 10c-12 1-20 11-20 22 0 13 9 22 21 22 8 0 15-4 19-11-3 2-7 3-11 3-9 0-16-6-16-15 0-8 4-15 11-21-1 0-2 0-4 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="46" cy="20" r="7" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-text">
            <strong>BANO QABIL</strong>
            <span>AI SERVICE DESK</span>
          </div>
        </div>

        <div className="header-status" aria-live="polite">
          <span className={`status-dot ${status}`} />
          <span>{statusLabel}</span>
        </div>
      </header>

      <section className="workspace">
        <aside className="intro-panel">
          <div className="intro-kicker">
            <Sparkles size={15} />
            One place for Bano Qabil help
          </div>

          <h1>
            Ask.
            <span> Get routed.</span>
            <br />
            Keep moving.
          </h1>

          <p>
            A focused service desk for public information, course
            curriculum, schedules, and guided student support.
          </p>

          <div className="focus-note">
            <div className="focus-icon">
              <MessageCircle size={18} />
            </div>
            <div>
              <strong>Start with a question</strong>
              <span>
                The service desk decides which knowledge source or tool
                should handle it.
              </span>
            </div>
          </div>

          <div className="quick-title">Common requests</div>
          <div className="quick-list">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  className="quick-action"
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(undefined, action.prompt)}
                  disabled={busy}
                >
                  <span className="quick-action-icon">
                    <Icon size={17} />
                  </span>
                  <span>
                    <strong>{action.label}</strong>
                    <small>{action.prompt}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="chat-window" aria-label="Bano Qabil AI Service Desk chat">
          <div className="chat-header">
            <div className="chat-agent">
              <div className="agent-avatar">
                <Bot size={19} />
              </div>
              <div>
                <strong>Bano Qabil AI Service Desk</strong>
                <span>
                  <span className={`status-dot ${status}`} />
                  {statusLabel}
                </span>
              </div>
            </div>

            <button
              className="icon-button"
              type="button"
              onClick={resetChat}
              aria-label="Reset chat"
              title="Reset chat"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <div className="chat-body" aria-live="polite">
            <div className="conversation">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${message.role === "user" ? "user" : "assistant"}`}
                >
                  {message.role === "assistant" && (
                    <div className="tiny-avatar" aria-hidden="true">
                      <Bot size={13} />
                    </div>
                  )}
                  <div
                    className={`message-bubble ${
                      message.role === "user" ? "user-bubble" : "assistant-bubble"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="message-row assistant">
                  <div className="tiny-avatar" aria-hidden="true">
                    <Bot size={13} />
                  </div>
                  <div className="message-bubble assistant-bubble typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="chat-footer">
            <div className="footer-hint">
              <Info size={13} />
              Student-specific requests may require verification.
            </div>

            <form className="composer" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question about Bano Qabil…"
                aria-label="Ask the Bano Qabil AI Service Desk"
                disabled={busy}
              />
              <button
                className="send-button"
                type="submit"
                disabled={!input.trim() || busy}
                aria-label="Send question"
              >
                <ArrowUp size={19} />
              </button>
            </form>
          </div>
        </section>
      </section>

      <footer className="app-footer">
        <span>Bano Qabil AI Service Desk</span>
        <span>Public information • Curriculum • Schedule • Student support</span>
      </footer>
    </main>
  );
}