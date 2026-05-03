"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import DocsAsk from "@/components/DocsAsk";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  html:root[data-theme][data-mode] {
    --bg: #080b12;
    --bg-2: #0d1220;
    --bg-3: #111827;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.14);
    --text: #f0f4ff;
    --text-muted: #8899b4;
    --text-dim: #4a5568;
    --accent: #f59e0b;
    --accent-dim: rgba(245,158,11,0.12);
    --accent-glow: rgba(245,158,11,0.25);
    --blue: #3b82f6;
    --blue-dim: rgba(59,130,246,0.12);
    --teal: #14b8a6;
    --teal-dim: rgba(20,184,166,0.12);
    --purple: #8b5cf6;
    --purple-dim: rgba(139,92,246,0.12);
    --card-bg: rgba(255,255,255,0.03);
    --card-bg-hover: rgba(255,255,255,0.06);
    --radius: 16px;
    --font-display: 'Bricolage Grotesque', sans-serif;
    --font-mono: 'DM Mono', monospace;

    /* Lock standard variables to prevent theme leakage */
    --background: var(--bg);
    --foreground: var(--text);
    --primary: var(--accent);
    --primary-foreground: #0a0a0a;
    --secondary: var(--bg-2);
    --muted: var(--text-dim);
    --muted-foreground: var(--text-muted);
    --card: var(--bg-2);
    --card-foreground: var(--text);
    --popover: var(--bg-2);
    --popover-foreground: var(--text);
    --input: var(--border);
    --ring: var(--accent);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-display);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .gradient-bg {
    background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,158,11,0.08) 0%, transparent 70%),
                radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59,130,246,0.05) 0%, transparent 60%),
                var(--bg);
    animation: gradShift 12s ease infinite alternate;
  }

  @keyframes gradShift {
    0%   { background-position: 50% -20%, 80% 60%; }
    100% { background-position: 50% -10%, 75% 55%; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
    50%       { transform: translateY(-14px) rotate(var(--rot, 0deg)); }
  }

  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
    50%       { transform: translateY(10px) rotate(var(--rot, 0deg)); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  @keyframes lineGrowY {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }

  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(10px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
    50%       { box-shadow: 0 0 0 12px transparent; }
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50%       { opacity: 1; transform: scale(1); }
  }

  .fade-up { animation: fadeUp 0.7s ease both; }

  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }
  .card:hover {
    background: var(--card-bg-hover);
    border-color: var(--border-hover);
    transform: translateY(-4px) scale(1.015);
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  }

  .btn-primary {
    background: var(--accent);
    color: #0a0a0a;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.01em;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .btn-primary:hover {
    transform: scale(1.04);
    box-shadow: 0 0 24px var(--accent-glow), 0 8px 20px rgba(0,0,0,0.3);
    background: #fbbf24;
    animation: pulse-glow 1.5s ease infinite;
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover {
    color: var(--text);
    border-color: var(--border-hover);
    background: var(--card-bg);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 100px;
    padding: 5px 14px;
  }

  .section { padding: 120px 24px; max-width: 1160px; margin: 0 auto; }

  .grid-lines {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  }

  .dropzone {
    border: 1px dashed var(--border);
    border-radius: 14px;
    padding: 20px;
    min-height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-muted);
    background: rgba(255,255,255,0.02);
    transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }

  .dropzone.dragging {
    border-color: rgba(245,158,11,0.6);
    background: var(--accent-dim);
    color: var(--text);
    box-shadow: 0 0 0 1px var(--accent-glow);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

/* ─────────────────────────────────────────────
   HOOK: Intersection Observer
───────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

/* ─────────────────────────────────────────────
   ICONS (inline SVG)
───────────────────────────────────────────── */
type IconProps = {
  d: string | string[];
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const Icon = ({
  d,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.6,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const icons = {
  chat: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  doc: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8",
  ],
  upload: [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M17 8l-5-5-5 5",
    "M12 3v12",
  ],
  brain: [
    "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",
    "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",
  ],
  highlight: [
    "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  ],
  quiz: [
    "M9 11l3 3L22 4",
    "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  ],
  share: [
    "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
    "M16 6l-4-4-4 4",
    "M12 2v13",
  ],
  summary: ["M4 6h16M4 12h16M4 18h10"],
  broadcast: [
    "M2 12h3",
    "M19 12h3",
    "M12 2v3",
    "M12 19v3",
    "M4.9 4.9l2.1 2.1",
    "M17 17l2.1 2.1",
    "M4.9 19.1l2.1-2.1",
    "M17 7l2.1-2.1",
  ],
  context: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  star: [
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  ],
  users: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  zap: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
};

/* ─────────────────────────────────────────────
   UPLOAD DROPZONE
───────────────────────────────────────────── */
function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    setFileName(files[0].name);
  };

  return (
    <div
      className={`dropzone${isDragging ? " dragging" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      aria-label="Upload file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {fileName ? (
        <span style={{ fontSize: 12 }}>
          Selected: <strong style={{ color: "var(--text)" }}>{fileName}</strong>
        </span>
      ) : (
        <span style={{ fontSize: 12, lineHeight: 1.5 }}>
          Drag file here to upload
          <br />
          <span style={{ color: "var(--text-dim)" }}>or click to browse</span>
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
function Nav() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        background: scrolled ? "rgba(8,11,18,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background:
                "linear-gradient(135deg, var(--accent) 0%, #f97316 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#0a0a0a",
            }}
          >
            T
          </div>
          <span
            style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}
          >
            ThinkIT
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How it Works", "Pricing"].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {isSignedIn ? (
            <Link
              className="btn-primary"
              style={{ padding: "9px 18px", textDecoration: "none" }}
              href="/dashboard"
            >
              Open App
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="btn-ghost" style={{ padding: "9px 18px" }}>
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary" style={{ padding: "9px 18px" }}>
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HERO FLOATING ELEMENTS
───────────────────────────────────────────── */
function FloatingUI() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 420,
        marginTop: 60,
      }}
    >
      {/* Center: Chat Card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          animation: "float 5s ease-in-out infinite",
        }}
      >
        <div className="card" style={{ padding: "16px 18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--accent),#f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon d={icons.brain} size={14} color="#0a0a0a" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--accent)",
              }}
            >
              @ai
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              className="card"
              style={{
                padding: "8px 12px",
                maxWidth: "70%",
                background: "var(--blue-dim)",
                borderColor: "rgba(59,130,246,0.15)",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Summarize this chapter
              </span>
            </div>
            <div
              className="card"
              style={{
                padding: "8px 12px",
                maxWidth: "85%",
                alignSelf: "flex-end",
                background: "var(--accent-dim)",
                borderColor: "rgba(245,158,11,0.15)",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text)" }}>
                Here's a summary of Chapter 3: The key concepts are...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Left: Document Card */}
      <div
        style={
          {
            position: "absolute",
            left: "8%",
            top: "20%",
            width: 200,
            animation: "floatB 6s ease-in-out infinite",
            ["--rot" as string]: "-4deg",
          } as CSSProperties
        }
      >
        <div className="card" style={{ padding: "14px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Icon d={icons.doc} size={16} color="var(--blue)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              lecture-notes.pdf
            </span>
          </div>
          {[80, 60, 90, 50].map((w, i) => (
            <div
              key={i}
              style={{
                height: 4,
                width: `${w}%`,
                background: "var(--border)",
                borderRadius: 4,
                marginBottom: 5,
              }}
            />
          ))}
          <div
            style={{
              marginTop: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "var(--blue-dim)",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          >
            <Icon d={icons.highlight} size={10} color="var(--blue)" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--blue)",
              }}
            >
              Selected
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quiz Card */}
      <div
        style={
          {
            position: "absolute",
            right: "8%",
            top: "15%",
            width: 210,
            animation: "float 7s ease-in-out infinite 1s",
            ["--rot" as string]: "3deg",
          } as CSSProperties
        }
      >
        <div className="card" style={{ padding: "14px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Icon d={icons.quiz} size={16} color="var(--teal)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              Quick Quiz
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--text)",
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            What is the primary function of mitochondria?
          </p>
          {["Energy production", "Protein synthesis"].map((opt, i) => (
            <div
              key={i}
              style={{
                padding: "5px 10px",
                borderRadius: 7,
                fontSize: 11,
                marginBottom: 5,
                cursor: "pointer",
                background:
                  i === 0 ? "rgba(20,184,166,0.15)" : "var(--card-bg)",
                border: `1px solid ${i === 0 ? "rgba(20,184,166,0.3)" : "var(--border)"}`,
                color: i === 0 ? "var(--teal)" : "var(--text-muted)",
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Score badge */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          animation: "float 4s ease-in-out infinite 0.5s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 100,
            padding: "8px 18px",
          }}
        >
          <Icon d={icons.star} size={14} color="var(--accent)" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text)",
            }}
          >
            Score: <strong style={{ color: "var(--accent)" }}>9/10</strong>
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--teal)",
              animation: "dotPulse 2s ease infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────── */
function Hero() {
  const { isSignedIn } = useAuth();
  return (
    <section
      className="gradient-bg"
      style={{
        position: "relative",
        paddingTop: 160,
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
      <div className="grid-lines" />
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="badge">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "dotPulse 2s ease infinite",
              }}
            />
            AI-powered learning workspace
          </span>
        </div>

        <h1
          className="fade-up"
          style={{
            animationDelay: "0.25s",
            fontSize: "clamp(42px, 6vw, 76px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.07,
            marginTop: 28,
            background:
              "linear-gradient(135deg, #ffffff 0%, rgba(240,244,255,0.6) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            maxWidth: 800,
            margin: "28px auto 0",
          }}
        >
          Turn conversations into
          <br />
          <span
            style={{
              background:
                "linear-gradient(90deg, var(--accent) 0%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            learning systems
          </span>
        </h1>

        <p
          className="fade-up"
          style={{
            animationDelay: "0.4s",
            fontSize: 18,
            color: "var(--text-muted)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "24px auto 0",
          }}
        >
          Chat, documents, and AI — all working together to help you understand,
          practice, and improve.
        </p>

        <div
          className="fade-up"
          style={{
            animationDelay: "0.55s",
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 40,
          }}
        >
          {isSignedIn ? (
            <>
              <Link
                className="btn-primary"
                style={{
                  padding: "14px 28px",
                  fontSize: 15,
                  textDecoration: "none",
                }}
                href="/dashboard"
              >
                Go to dashboard
              </Link>
              <button
                className="btn-ghost"
                style={{
                  padding: "14px 28px",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>See How It Works</span>
                <span style={{ opacity: 0.6 }}>→</span>
              </button>
            </>
          ) : (
            <>
              <SignUpButton mode="modal">
                <button
                  className="btn-primary"
                  style={{ padding: "14px 28px", fontSize: 15 }}
                >
                  Get Started
                </button>
              </SignUpButton>
              <button
                className="btn-ghost"
                style={{
                  padding: "14px 28px",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>See How It Works</span>
                <span style={{ opacity: 0.6 }}>→</span>
              </button>
            </>
          )}
        </div>

        <FloatingUI />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PROBLEM → SOLUTION
───────────────────────────────────────────── */
function ProblemSolution() {
  const [ref, vis] = useReveal();
  const problems = [
    "Chat is disconnected from knowledge",
    "Documents are passive",
    "Quizzes are isolated",
  ];
  const solutions = [
    "AI understands your context",
    "Documents become interactive",
    "Quizzes come from what you learn",
  ];

  return (
    <section
      style={{
        padding: "120px 24px",
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* Problem */}
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(28px)",
            transition: "all 0.7s ease",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>The problem</span>
          </div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginBottom: 28,
              lineHeight: 1.2,
            }}
          >
            Learning tools are
            <br />
            <span style={{ color: "var(--text-muted)" }}>fragmented</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {problems.map((p, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#ef4444" }}>×</span>
                </div>
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Solution */}
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(28px)",
            transition: "all 0.7s ease 0.2s",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>The solution</span>
          </div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginBottom: 28,
              lineHeight: 1.2,
            }}
          >
            ThinkIT connects
            <br />
            <span style={{ color: "var(--accent)" }}>everything</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {solutions.map((s, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(20,184,166,0.1)",
                    border: "1px solid rgba(20,184,166,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--teal)" }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: "var(--text)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: icons.upload,
      color: "var(--blue)",
      label: "Upload Document",
      desc: "Drop in PDFs, notes, or any material you want to master.",
    },
    {
      icon: icons.brain,
      color: "var(--accent)",
      label: "Ask AI",
      desc: "Use @ai in chat to ask anything about your content instantly.",
    },
    {
      icon: icons.highlight,
      color: "var(--purple)",
      label: "Highlight & Explore",
      desc: "Select any text and get instant AI-powered explanations.",
    },
    {
      icon: icons.quiz,
      color: "var(--teal)",
      label: "Generate Quiz",
      desc: "Turn your document into targeted quiz questions with one click.",
    },
    {
      icon: icons.share,
      color: "#f97316",
      label: "Share & Solve",
      desc: "Broadcast quizzes to your room and tackle them together.",
    },
  ];
  const [ref, vis] = useReveal(0.1);

  return (
    <section className="section">
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span className="badge" style={{ marginBottom: 20 }}>
          How it works
        </span>
        <h2
          style={{
            fontSize: "clamp(32px,4vw,52px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Five steps to mastery
        </h2>
      </div>

      <div
        ref={ref}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          position: "relative",
        }}
      >
        {/* Connecting line */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)",
            transformOrigin: "left",
            animation: vis ? "lineGrow 1.2s ease 0.3s both" : "none",
          }}
        />

        {steps.map((step, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: "28px 20px 24px",
              textAlign: "center",
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(28px)",
              transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `color-mix(in srgb, ${step.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${step.color} 25%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Icon d={step.icon} size={22} color={step.color} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-dim)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Step {i + 1}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              {step.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {step.desc}
            </div>
            {step.label === "Upload Document" && (
              <div style={{ marginTop: 14 }}>
                <UploadDropzone />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES GRID
───────────────────────────────────────────── */
function Features() {
  const features = [
    {
      icon: icons.chat,
      color: "var(--blue)",
      title: "AI Chat",
      desc: "Real-time conversations with AI woven directly into your workspace. Mention @ai anywhere.",
    },
    {
      icon: icons.doc,
      color: "var(--accent)",
      title: "Smart Documents",
      desc: "Upload files that become interactive — highlight text, ask questions, get insights.",
    },
    {
      icon: icons.summary,
      color: "var(--teal)",
      title: "Summarization",
      desc: "Generate clear, structured summaries from any document in seconds.",
    },
    {
      icon: icons.quiz,
      color: "var(--purple)",
      title: "Quiz System",
      desc: "Auto-generated quizzes tailored to your material. Instant feedback, trackable progress.",
    },
    {
      icon: icons.broadcast,
      color: "#f97316",
      title: "Broadcast",
      desc: "Push quizzes into shared rooms and turn studying into a live event.",
    },
    {
      icon: icons.context,
      color: "var(--teal)",
      title: "Context-aware AI",
      desc: "The AI understands your conversation history and document context, not just keywords.",
    },
  ];

  const [ref, vis] = useReveal(0.05);

  return (
    <section
      style={{
        padding: "120px 24px",
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span className="badge" style={{ marginBottom: 20 }}>
            Core Features
          </span>
          <h2
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Everything you need
          </h2>
          <p
            style={{ color: "var(--text-muted)", marginTop: 16, fontSize: 16 }}
          >
            One platform. No context switching.
          </p>
        </div>

        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: "28px",
                opacity: vis ? 1 : 0,
                transform: vis
                  ? "translateY(0) scale(1)"
                  : "translateY(24px) scale(0.97)",
                transition: `all 0.6s ease ${i * 0.09}s`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${f.color} 20%, transparent)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <Icon d={f.icon} size={20} color={f.color} />
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   QUIZ FLOW (HIGHLIGHT SECTION)
───────────────────────────────────────────── */
function QuizFlow() {
  const { isSignedIn } = useAuth();
  const [ref, vis] = useReveal(0.2);
  const nodes = [
    { label: "Document", icon: icons.doc, color: "var(--blue)" },
    { label: "Summary", icon: icons.summary, color: "var(--accent)" },
    { label: "Quiz", icon: icons.quiz, color: "var(--purple)" },
    { label: "Score", icon: icons.star, color: "var(--teal)" },
  ];

  return (
    <section
      style={{
        padding: "140px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Emphasis glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(28px)",
            transition: "all 0.7s ease",
          }}
        >
          <span className="badge" style={{ marginBottom: 20 }}>
            Quiz System
          </span>
          <h2
            style={{
              fontSize: "clamp(30px,3.5vw,48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Learning that
            <br />
            <span style={{ color: "var(--accent)" }}>adapts to you</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.75,
              maxWidth: 420,
            }}
          >
            Generate quizzes from what you just learned, share them, and test
            understanding together. Every quiz is different because every
            learner is different.
          </p>
          {isSignedIn ? (
            <Link
              className="btn-primary"
              style={{
                marginTop: 32,
                textDecoration: "none",
                display: "inline-block",
              }}
              href="/dashboard"
            >
              Go to dashboard →
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ marginTop: 32 }}>
                Try it free →
              </button>
            </SignUpButton>
          )}
        </div>

        {/* Flow nodes */}
        <div
          style={{ opacity: vis ? 1 : 0, transition: "opacity 0.5s ease 0.2s" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {nodes.map((n, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", flex: 1 }}
              >
                <div
                  style={{
                    flex: "0 0 auto",
                    opacity: vis ? 1 : 0,
                    transform: vis ? "scale(1)" : "scale(0.7)",
                    transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.15}s`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background: `color-mix(in srgb, ${n.color} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${n.color} 30%, transparent)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      boxShadow: `0 0 24px color-mix(in srgb, ${n.color} 10%, transparent)`,
                    }}
                  >
                    <Icon d={n.icon} size={24} color={n.color} />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {n.label}
                  </span>
                </div>
                {i < nodes.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      margin: "0 4px",
                      background: `linear-gradient(90deg, ${nodes[i].color}, ${nodes[i + 1].color})`,
                      opacity: 0.4,
                      marginBottom: 24,
                      transformOrigin: "left",
                      transform: vis ? "scaleX(1)" : "scaleX(0)",
                      transition: `transform 0.5s ease ${0.45 + i * 0.15}s`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COLLABORATION
───────────────────────────────────────────── */
function Collaboration() {
  const [ref, vis] = useReveal(0.2);
  const bubbles = [
    {
      text: "I'm stuck on chapter 4 — anyone?",
      side: "left",
      color: "var(--blue-dim)",
      border: "rgba(59,130,246,0.15)",
      name: "Priya",
    },
    {
      text: "@ai can you explain photosynthesis for chapter 4?",
      side: "right",
      color: "var(--accent-dim)",
      border: "rgba(245,158,11,0.15)",
      name: "You",
    },
    {
      text: "Photosynthesis converts light energy into glucose using CO₂ and water...",
      side: "left",
      color: "var(--card-bg)",
      border: "var(--border)",
      name: "AI",
    },
    {
      text: "That helped! Taking the quiz now 🎯",
      side: "right",
      color: "var(--teal-dim)",
      border: "rgba(20,184,166,0.15)",
      name: "Priya",
    },
  ];

  return (
    <section
      style={{
        padding: "120px 24px",
        background: "var(--bg-2)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Chat bubbles */}
        <div
          ref={ref}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {bubbles.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: b.side === "right" ? "flex-end" : "flex-start",
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(12px)",
                transition: `all 0.5s ease ${i * 0.15}s`,
              }}
            >
              {b.side === "left" && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    marginRight: 8,
                    flexShrink: 0,
                    color: "var(--text-muted)",
                  }}
                >
                  {b.name[0]}
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-dim)",
                    marginBottom: 4,
                    textAlign: b.side === "right" ? "right" : "left",
                  }}
                >
                  {b.name}
                </div>
                <div
                  style={{
                    background: b.color,
                    border: `1px solid ${b.border}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    maxWidth: 280,
                    fontSize: 13,
                    color: "var(--text)",
                    lineHeight: 1.6,
                  }}
                >
                  {b.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Text */}
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(28px)",
            transition: "all 0.7s ease 0.2s",
          }}
        >
          <span className="badge" style={{ marginBottom: 20 }}>
            Collaboration
          </span>
          <h2
            style={{
              fontSize: "clamp(30px,3.5vw,48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Learn together,
            <br />
            <span style={{ color: "var(--blue)" }}>not alone</span>
          </h2>
          {[
            { icon: icons.users, text: "Rooms for shared discussion" },
            { icon: icons.brain, text: "AI joins your conversation" },
            { icon: icons.quiz, text: "Quizzes become group activity" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--blue-dim)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon d={item.icon} size={16} color="var(--blue)" />
              </div>
              <span style={{ fontSize: 15, color: "var(--text-muted)" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA
───────────────────────────────────────────── */
function CTA() {
  const { isSignedIn } = useAuth();
  const [ref, vis] = useReveal(0.3);

  return (
    <section style={{ padding: "120px 24px" }}>
      <div
        ref={ref}
        style={{
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.05), rgba(59,130,246,0.05))",
            border: "1px solid var(--border)",
            borderRadius: 28,
            padding: "72px 48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <span className="badge" style={{ marginBottom: 24 }}>
            Get started free
          </span>
          <h2
            style={{
              fontSize: "clamp(32px,4vw,56px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Start learning
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,var(--accent),#f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              smarter today
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.75,
              marginBottom: 36,
            }}
          >
            Create your first room and experience AI-powered learning. No credit
            card required.
          </p>
          {isSignedIn ? (
            <Link
              className="btn-primary"
              style={{
                padding: "16px 36px",
                fontSize: 16,
                borderRadius: 12,
                textDecoration: "none",
              }}
              href="/dashboard"
            >
              Go to dashboard
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button
                className="btn-primary"
                style={{ padding: "16px 36px", fontSize: 16, borderRadius: 12 }}
              >
                Get Started — it's free
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{ borderTop: "1px solid var(--border)", padding: "48px 24px" }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(135deg,var(--accent),#f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#0a0a0a",
            }}
          >
            T
          </div>
          <span
            style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}
          >
            ThinkIT
          </span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Privacy", "Terms", "Blog", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                color: "var(--text-dim)",
                fontSize: 13,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-dim)";
              }}
            >
              {l}
            </a>
          ))}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-dim)",
          }}
        >
          © 2025 ThinkIT
        </span>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Nav />
        <Hero />
        <DocsAsk />
        <ProblemSolution />
        <HowItWorks />
        <Features />
        <QuizFlow />
        <Collaboration />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
