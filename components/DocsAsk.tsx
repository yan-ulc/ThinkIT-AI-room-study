"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
// step 0 = idle
// step 1 = doc visible
// step 2 = highlight active
// step 3 = ask-ai btn visible
// step 4 = click + focus shift
// step 5 = ai response + text reveal

const AI_LINES = [
  "The clause restricts the resale of licensed software to",
  "third parties without prior written consent from the licensor.",
  "This is standard in enterprise SaaS agreements.",
];

export default function DocsAsk() {
  const [step, setStep] = useState(0);
  const [btnPressed, setBtnPressed] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Subtle parallax — document moves a little, bubble moves less
  const docX = useTransform(mouseX, [-200, 200], [-4, 4]);
  const docY = useTransform(mouseY, [-200, 200], [-3, 3]);
  const bubbleX = useTransform(mouseX, [-200, 200], [-2, 2]);
  const bubbleY = useTransform(mouseY, [-200, 200], [-1.5, 1.5]);

  // Orchestrate the full sequence on mount with looping
  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function run() {
      while (!cancelled) {
        // Reset state
        setStep(0);
        setVisibleLines([]);
        setBtnPressed(false);

        await wait(500);
        if (cancelled) break;

        // Step 1 — document enters
        setStep(1);
        await wait(900);
        if (cancelled) break;

        // Step 2 — highlight expands
        setStep(2);
        await wait(900);
        if (cancelled) break;

        // Step 3 — Ask AI button fades in
        setStep(3);
        await wait(1100);
        if (cancelled) break;

        // Step 4 — click interaction
        setStep(4);
        setBtnPressed(true);
        await wait(140);
        if (cancelled) break;
        setBtnPressed(false);
        await wait(420);
        if (cancelled) break;

        // Step 5 — AI bubble enters
        setStep(5);
        await wait(400);
        if (cancelled) break;

        // Staggered line reveal
        for (let i = 0; i < AI_LINES.length; i++) {
          if (i > 0) await wait(200);
          if (cancelled) break;
          setVisibleLines((prev) => [...prev, i]);
        }

        // Hold the final state for a few seconds before looping
        await wait(5000);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Track mouse for parallax
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full min-h-[600px] rounded-2xl overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* ── Document Card ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div
            key="doc"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{
              opacity: step >= 5 ? 0.9 : 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{
              opacity: { duration: 0.8, ease: "easeInOut" },
              y: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 0.8, ease: "easeInOut" },
            }}
            style={{ x: docX, y: docY, position: "relative", zIndex: 10 }}
          >
            <div
              className="rounded-2xl select-none"
              style={{
                width: 460,
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                padding: "28px 28px 24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Doc chrome */}
              <div className="flex items-center gap-2 mb-5">
                {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                      opacity: 0.8,
                    }}
                  />
                ))}
                <span
                  className="ml-2"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-dim)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Agreement — Section 4.2
                </span>
              </div>

              <div
                style={{ height: 1, background: "var(--border)", marginBottom: 18 }}
              />

              {/* Skeleton lines */}
              <SkeletonBlock widths={["88%", "72%"]} />

              {/* ── Highlighted paragraph ── */}
              <div className="relative" style={{ marginBottom: 10 }}>
                {step >= 2 && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      scaleX: { duration: 0.8, ease: "easeInOut" },
                      opacity: { duration: 0.8, ease: "easeInOut" },
                    }}
                    style={{
                      position: "absolute",
                      inset: "-4px -8px",
                      background: "var(--blue-dim)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: 6,
                      transformOrigin: "left center",
                      zIndex: 1,
                    }}
                  />
                )}

                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.72,
                    color: "var(--text)",
                    letterSpacing: "0.01em",
                    position: "relative",
                    zIndex: 2,
                    padding: "0 4px",
                  }}
                >
                  Licensee shall not sublicense, sell, resell, transfer,
                  assign, or otherwise dispose of licensed materials to any
                  third party without express prior written consent of the
                  Licensor.
                </p>

                {/* ── Ask AI button ── */}
                <AnimatePresence>
                  {step >= 3 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: btnPressed ? 0.95 : 1,
                      }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{
                        opacity: { duration: 0.4, ease: "easeInOut" },
                        y: { duration: 0.4, ease: "easeInOut" },
                        scale: { duration: 0.2, ease: "easeInOut" },
                      }}
                      whileHover={step < 4 ? { scale: 1.05 } : {}}
                      style={{
                        position: "absolute",
                        top: -40,
                        right: -10,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "var(--accent)",
                        color: "#0a0a0a",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "default",
                        boxShadow: "0 4px 14px var(--accent-glow)",
                        whiteSpace: "nowrap",
                        zIndex: 20,
                      }}
                    >
                      <AskAiIcon />
                      Ask AI
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* More skeleton lines */}
              <SkeletonBlock widths={["94%", "61%"]} />
              <SkeletonBlock widths={["82%", "76%", "44%"]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Response Bubble (Below Document) ───────────────────────── */}
      <div style={{ height: 160, display: "flex", alignItems: "flex-start", justifyContent: "center", marginTop: 24, width: "100%", position: "relative", zIndex: 20 }}>
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                x: bubbleX,
                y: bubbleY,
                width: 420,
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "20px 24px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Subtle idle float */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                {/* Bubble header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, var(--accent) 0%, #f97316 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#0a0a0a",
                      flexShrink: 0,
                    }}
                  >
                    AI
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Analysis
                  </span>
                </div>

                {/* Staggered text lines */}
                <div style={{ minHeight: 60 }}>
                  {AI_LINES.map((line, i) => (
                    <AnimatePresence key={i}>
                      {visibleLines.includes(i) && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                          style={{
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            color: "var(--text)",
                            letterSpacing: "0.01em",
                            marginBottom: i < AI_LINES.length - 1 ? 4 : 0,
                          }}
                        >
                          {line}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SkeletonBlock({ widths }: { widths: string[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {widths.map((w, i) => (
        <div
          key={i}
          style={{
            height: 10,
            background: "var(--border)",
            borderRadius: 5,
            marginBottom: 8,
            width: w,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

function AskAiIcon() {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        background: "#0a0a0a",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        lineHeight: 1,
        color: "var(--accent)",
        fontWeight: 700,
      }}
    >
      ✦
    </div>
  );
}