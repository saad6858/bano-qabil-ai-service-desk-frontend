"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  GraduationCap,
  Menu,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

type ChatStatus = "ready" | "thinking" | "error";

const STORAGE = {
  session: "bq-service-desk-session-v3",
  messages: "bq-service-desk-messages-v3",
};

const starterPrompts = [
  {
    label: "Courses",
    text: "What courses are currently offered by Bano Qabil?",
    icon: GraduationCap,
  },
  {
    label: "Curriculum",
    text: "What topics are covered in the Agentic AI course?",
    icon: Sparkles,
  },
  {
    label: "Schedule",
    text: "What is my class schedule tomorrow?",
    icon: CalendarDays,
  },
  {
    label: "Application",
    text: "I want to check my application status.",
    icon: ShieldCheck,
  },
];

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bq-web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function initialWelcome(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Assalam-o-Alaikum. I’m the Bano Qabil AI Service Desk. Ask about courses, curriculum, schedules, registration, or student support.",
    createdAt: Date.now(),
  };
}

function cleanAssistantText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, "").trim())
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}

function looksLikeSensitiveVerification(text: string) {
  return /\b\d{5}-?\d{7}-?\d\b/.test(text) || /\b\d{4,8}\b/.test(text);
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcome()]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const statusText = useMemo(() => {
    if (status === "thinking") return "Thinking";
    if (status === "error") return "Service issue";
    return "Online";
  }, [status]);

  useEffect(() => {
    try {
      const storedSession = window.localStorage.getItem(STORAGE.session);
      const storedMessages = window.localStorage.getItem(STORAGE.messages);

      setSessionId(storedSession || makeSessionId());

      if (storedMessages) {
        const parsed: unknown = JSON.parse(storedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed as ChatMessage[]);
        }
      }
    } catch {
      setSessionId(makeSessionId());
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !sessionId) return;
    window.localStorage.setItem(STORAGE.session, sessionId);

    // Keep the useful chat across refreshes, but avoid storing common raw
    // CNIC/OTP-like values in browser local storage.
    const safeMessages = messages.map((message) => ({
      ...message,
      content: looksLikeSensitiveVerification(message.content)
        ? "[verification message omitted from local chat history]"
        : message.content,
    }));

    window.localStorage.setItem(STORAGE.messages, JSON.stringify(safeMessages));
  }, [hydrated, sessionId, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, status]);

  function resizeInput() {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
  }

  async function sendMessage(event?: { preventDefault: () => void }, override?: string) {
    event?.preventDefault();
    const question = (override ?? input).trim();
    if (!question || status === "thinking") return;

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: question,
        createdAt: Date.now(),
      },
    ]);
    setInput("");
    setStatus("thinking");
    setMenuOpen(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          channel: "web",
          session_id: sessionId || makeSessionId(),
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

      const answer = cleanAssistantText(
        data.response || "I received the request, but the service returned no answer.",
      );

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: answer,
          createdAt: Date.now(),
        },
      ]);
      setStatus("ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: `I couldn’t reach the AI service. ${message}`,
          createdAt: Date.now(),
        },
      ]);
      setStatus("error");
    } finally {
      requestAnimationFrame(resizeInput);
    }
  }

  function resetChat() {
    const freshSession = makeSessionId();
    setSessionId(freshSession);
    setMessages([initialWelcome()]);
    setInput("");
    setStatus("ready");
    setMenuOpen(false);
    window.localStorage.removeItem(STORAGE.messages);
    window.localStorage.setItem(STORAGE.session, freshSession);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function onInputChange(value: string) {
    setInput(value);
    requestAnimationFrame(resizeInput);
  }

  return (
    <main className="service-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="grid-glow" />

      <header className="topbar">
        <div className="brand" aria-label="Bano Qabil AI Service Desk">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <path
                d="M31 13c-10 2-17 10-17 21 0 11 8 19 19 19 8 0 14-4 18-11-3 2-6 3-10 3-8 0-14-5-14-13 0-7 3-13 9-18-2-1-3-1-5-1Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="47" cy="19" r="6" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="brand-name">BANO QABIL</div>
            <div className="brand-sub">AI SERVICE DESK</div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="live-pill">
            <span className={`live-dot ${status}`} />
            <span>{statusText}</span>
          </div>

          <div className="menu-wrap">
            <button
              className="icon-button"
              type="button"
              aria-label="Open chat menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {menuOpen && (
              <div className="menu-popover">
                <button type="button" onClick={resetChat}>
                  <RotateCcw size={16} />
                  New conversation
                </button>
                <div className="menu-hint">
                  Your chat stays in this browser after refresh.
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="chat-stage">
        <div className="chat-card">
          <div className="chat-card-head">
            <div className="agent-heading">
              <div className="agent-logo">
                <Bot size={19} />
              </div>
              <div>
                <div className="agent-title">Bano Qabil AI Service Desk</div>
                <div className="agent-caption">
                  Public information, curriculum, schedules & student support
                </div>
              </div>
            </div>

            <div className="desktop-secure">
              <Check size={14} />
              Secure channel
            </div>
          </div>

          <div className="chat-scroll" aria-live="polite">
            {messages.length === 1 && (
              <div className="welcome-zone">
                <div className="welcome-badge">
                  <Sparkles size={14} />
                  Bano Qabil support, in one place
                </div>
                <h1>
                  Ask anything.
                  <span> Get to the right answer.</span>
                </h1>
                <p>
                  One service desk for Bano Qabil website information, course curriculum,
                  live schedules, and verified student support.
                </p>

                <div className="prompt-grid">
                  {starterPrompts.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        type="button"
                        className="prompt-card"
                        key={prompt.label}
                        onClick={() => sendMessage(undefined, prompt.text)}
                        disabled={status === "thinking"}
                      >
                        <span className="prompt-icon">
                          <Icon size={17} />
                        </span>
                        <span className="prompt-copy">
                          <strong>{prompt.label}</strong>
                          <small>{prompt.text}</small>
                        </span>
                        <ChevronDown className="prompt-arrow" size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="message-list">
              {messages.map((message) => (
                <div className={`message-row ${message.role}`} key={message.id}>
                  {message.role === "assistant" && (
                    <div className="message-avatar" aria-hidden="true">
                      <Bot size={15} />
                    </div>
                  )}
                  <div className="message-bubble">
                    <div className="message-text">{message.content}</div>
                  </div>
                </div>
              ))}

              {status === "thinking" && (
                <div className="message-row assistant">
                  <div className="message-avatar" aria-hidden="true">
                    <Bot size={15} />
                  </div>
                  <div className="message-bubble typing-bubble" aria-label="Assistant is typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="composer-area">
            <div className="composer-note">
              <CircleHelp size={14} />
              Student-specific requests may require verification.
            </div>
            <form className="composer" onSubmit={(event) => void sendMessage(event)}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void sendMessage(event);
                  }
                }}
                placeholder="Ask a question about Bano Qabil..."
                aria-label="Ask a question about Bano Qabil"
                rows={1}
                maxLength={2000}
                disabled={status === "thinking"}
              />
              <button
                className="send-button"
                type="submit"
                disabled={!input.trim() || status === "thinking"}
                aria-label="Send question"
              >
                <ArrowUp size={19} strokeWidth={2.5} />
              </button>
            </form>
            <div className="composer-footer">
              <span>Enter to send · Shift + Enter for a new line</span>
              <span>{input.length}/2000</span>
            </div>
          </div>
        </div>

        <div className="stage-footer">
          <span>Built for the Bano Qabil AI Service Desk</span>
          <span className="footer-separator">•</span>
          <span>Website · Curriculum · Schedule · Student Support</span>
        </div>
      </section>
    </main>
  );
}
