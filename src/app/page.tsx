"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  GraduationCap,
  Menu,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickActions = [
  {
    title: "Courses",
    description: "Explore Bano Qabil courses and public program information.",
    icon: BookOpen,
    prompt: "What courses does Bano Qabil offer?",
  },
  {
    title: "Curriculum",
    description: "Ask about topics and modules covered in a Bano Qabil course.",
    icon: GraduationCap,
    prompt: "What topics are covered in the Agentic AI course?",
  },
  {
    title: "Schedule",
    description: "Ask for current class timing and schedule information.",
    icon: CalendarDays,
    prompt: "What is my class schedule for tomorrow?",
  },
  {
    title: "Application Status",
    description: "Start a guided flow to check your application status.",
    icon: ShieldCheck,
    prompt: "I want to check my Bano Qabil application status.",
  },
];

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "https://banoqabil.org/about" },
  { label: "Courses", href: "https://banoqabil.org/courses" },
  { label: "Track Application", href: "https://banoqabil.org/track-application" },
  { label: "Campuses", href: "https://banoqabil.org/campuses" },
];

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `bq-web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Assalam-o-Alaikum! I am the Bano Qabil AI Service Desk. Ask me about courses, curriculum, schedules, registration, campuses, FAQs or application status.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionId, setSessionId] = useState("browser-session");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(createSessionId());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  const statusText = useMemo(
    () => (busy ? "Connecting to the AI service…" : "Service desk online"),
    [busy],
  );

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const question = input.trim();
    if (!question || busy) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

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

      const data = (await response.json()) as { response?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "The service desk returned an error.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: data.response || "I received the request but no answer was returned.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            error instanceof Error
              ? `I could not reach the AI service right now. ${error.message}`
              : "I could not reach the AI service right now. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function useQuickAction(prompt: string) {
    setInput(prompt);
    document.getElementById("service-desk")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main id="home" className="site-shell">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Free IT education • Digital skills • Career support</span>
          <span className="top-strip-desktop">Bano Qabil Pakistan</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="Bano Qabil AI Service Desk home">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-swoosh" />
              <span className="brand-dot" />
            </span>
            <span className="brand-copy">
              <strong>BANO QABIL</strong>
              <small>AI SERVICE DESK</small>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="header-login" href="https://banoqabil.org/login">
              Student Login
            </a>
            <a className="header-cta" href="https://banoqabil.org/register/student">
              Register as Student <ArrowRight size={16} />
            </a>
            <button
              className="icon-button mobile-menu-button"
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="https://banoqabil.org/login">Student Login</a>
            <a className="mobile-menu-cta" href="https://banoqabil.org/register/student">
              Register as Student <ArrowRight size={16} />
            </a>
          </div>
        )}
      </header>

      <section className="hero-section">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-grid-pattern" />
        <div className="container hero-grid">
          <div className="hero-copy reveal-up">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Bano Qabil AI Service Desk
            </div>
            <h1>
              Get answers.
              <span> Find the right path.</span>
              <br />
              Keep moving forward.
            </h1>
            <p>
              One service desk for Bano Qabil information, course curriculum, live schedules and
              guided student support — connected to the AI system behind your request.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => useQuickAction(quickActions[0].prompt)}>
                Ask the AI Service Desk <ArrowRight size={18} />
              </button>
              <a className="secondary-button" href="https://banoqabil.org/courses">
                Explore Courses
              </a>
            </div>
            <div className="hero-trust-row">
              <span><CheckCircle2 size={17} /> Grounded knowledge</span>
              <span><ShieldCheck size={17} /> Private status flow</span>
              <span><Clock3 size={17} /> Live schedule tool</span>
            </div>
          </div>

          <div className="hero-preview-wrap reveal-up reveal-delay">
            <div className="hero-preview-glow" />
            <div className="hero-preview">
              <div className="preview-topbar">
                <div className="preview-title">
                  <span className="preview-icon"><Bot size={16} /></span>
                  <div>
                    <strong>Bano Qabil AI</strong>
                    <small>{statusText}</small>
                  </div>
                </div>
                <span className="online-indicator"><span /> LIVE</span>
              </div>
              <div className="preview-body">
                <div className="preview-message preview-message-ai">
                  <Sparkles size={15} />
                  What can I help you with today?
                </div>
                <div className="preview-prompt-row">
                  <span>Courses</span>
                  <span>Schedule</span>
                  <span>Application Status</span>
                </div>
                <div className="preview-message preview-message-user">
                  What courses are currently available?
                </div>
                <div className="preview-message preview-message-ai answer-preview">
                  I can search the official Bano Qabil knowledge base and share the relevant course information.
                </div>
              </div>
              <div className="preview-input">
                <span>Ask anything about Bano Qabil…</span>
                <span className="send-preview"><Send size={16} /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="capability-strip">
        <div className="container capability-grid">
          <div>
            <span className="mini-label">ONE SERVICE DESK</span>
            <h2>Designed around the questions students actually ask.</h2>
          </div>
          <p>
            The interface follows the structure and service language of the official Bano Qabil site while keeping the AI layer focused on answering, routing and retrieving the right information.
          </p>
        </div>
      </section>

      <section className="quick-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Explore the service desk</span>
              <h2>Start with a common request</h2>
            </div>
            <p>Choose a starting point and the question will be placed into the live assistant.</p>
          </div>

          <div className="quick-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  className="quick-card"
                  type="button"
                  key={action.title}
                  onClick={() => useQuickAction(action.prompt)}
                >
                  <span className="quick-icon"><Icon size={22} /></span>
                  <span className="quick-card-title">{action.title}</span>
                  <span className="quick-card-description">{action.description}</span>
                  <span className="quick-card-link">Ask now <ArrowRight size={16} /></span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="service-desk" className="service-section">
        <div className="service-backdrop" />
        <div className="container service-grid">
          <div className="service-intro">
            <span className="section-kicker light">AI-powered support</span>
            <h2>Your question goes to the right source.</h2>
            <p>
              Public website information, curriculum knowledge, schedule data and private student
              status are intentionally separated behind the service-desk router.
            </p>

            <div className="routing-list">
              <div><BookOpen size={18} /><span><strong>Website knowledge</strong><small>Public Bano Qabil information</small></span></div>
              <div><GraduationCap size={18} /><span><strong>Curriculum</strong><small>Course topics and modules</small></span></div>
              <div><CalendarDays size={18} /><span><strong>Schedule</strong><small>Live calendar-based answers</small></span></div>
              <div><ShieldCheck size={18} /><span><strong>Student status</strong><small>Verification before private data</small></span></div>
            </div>
          </div>

          <div className="chat-card">
            <div className="chat-card-header">
              <div className="chat-heading">
                <span className="chat-avatar"><Bot size={20} /></span>
                <div>
                  <strong>Bano Qabil AI Service Desk</strong>
                  <span><span className="status-dot" /> {statusText}</span>
                </div>
              </div>
              <button className="chat-help" type="button" aria-label="Chat help">
                <CircleHelp size={19} />
              </button>
            </div>

            <div className="chat-messages" aria-live="polite">
              {messages.map((message) => (
                <div
                  className={`chat-message-row ${message.role === "user" ? "is-user" : "is-ai"}`}
                  key={message.id}
                >
                  {message.role === "assistant" && <span className="chat-small-avatar"><Bot size={14} /></span>}
                  <div className={`chat-bubble ${message.role === "user" ? "bubble-user" : "bubble-ai"}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="chat-message-row is-ai">
                  <span className="chat-small-avatar"><Bot size={14} /></span>
                  <div className="chat-bubble bubble-ai typing-indicator" aria-label="Assistant is typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-quick-row">
              <button type="button" onClick={() => useQuickAction("What courses does Bano Qabil offer?")}>Courses</button>
              <button type="button" onClick={() => useQuickAction("How can I register for Bano Qabil?")}>Registration</button>
              <button type="button" onClick={() => useQuickAction("Where are Bano Qabil campuses located?")}>Campuses</button>
            </div>

            <form className="chat-form" onSubmit={sendMessage}>
              <div className="chat-input-wrap">
                <Search size={18} />
                <input
                  aria-label="Ask the Bano Qabil AI Service Desk"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about courses, curriculum, schedule, registration…"
                  disabled={busy}
                />
              </div>
              <button className="send-button" type="submit" disabled={!input.trim() || busy} aria-label="Send message">
                <Send size={18} />
              </button>
            </form>
            <div className="chat-card-note">For student-specific information, the service desk may request verification.</div>
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-kicker">Simple by design</span>
            <h2>A clearer way to get help</h2>
            <p>From the first question to the right answer, the service desk keeps the journey focused.</p>
          </div>
          <div className="process-grid">
            {[
              ["01", "Ask", "Type a normal question instead of figuring out which system to open."],
              ["02", "Route", "The manager sends the request to the appropriate knowledge source or tool."],
              ["03", "Retrieve", "The selected agent gets the relevant grounded information."],
              ["04", "Respond", "You receive a concise answer through one familiar interface."],
            ].map(([number, title, text]) => (
              <div className="process-item" key={number}>
                <span className="process-number">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <span className="section-kicker light">Ready to get started?</span>
            <h2>Ask the Bano Qabil AI Service Desk.</h2>
            <p>Start with a course question, a schedule question or your application journey.</p>
          </div>
          <button className="primary-button light-button" type="button" onClick={() => useQuickAction("What can the Bano Qabil AI Service Desk help me with?")}>
            Start a conversation <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand-block">
            <div className="brand footer-brand">
              <span className="brand-mark" aria-hidden="true">
                <span className="brand-swoosh" />
                <span className="brand-dot" />
              </span>
              <span className="brand-copy">
                <strong>BANO QABIL</strong>
                <small>AI SERVICE DESK</small>
              </span>
            </div>
            <p>AI-powered support for the Bano Qabil student journey.</p>
          </div>
          <div>
            <h3>Main Links</h3>
            <a href="https://banoqabil.org/">Home</a>
            <a href="https://banoqabil.org/courses">All Courses</a>
            <a href="https://banoqabil.org/login">Student Login</a>
          </div>
          <div>
            <h3>Support</h3>
            <a href="https://banoqabil.org/contact">Contact Us</a>
            <a href="https://banoqabil.org/faqs">FAQ&apos;s</a>
            <a href="https://banoqabil.org/about">About Us</a>
          </div>
          <div>
            <h3>Get In Touch</h3>
            <span>info@banoqabil.org</span>
            <span>+92 32 8888 8515</span>
            <span>Alkhidmat Foundation Head Office, 3km Khayaban-e-Jinnah, Lahore</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Bano Qabil AI Service Desk</span>
          <span>Built for the Bano Qabil Agentic AI final project</span>
        </div>
      </footer>
    </main>
  );
}
