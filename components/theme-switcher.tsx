"use client";

import { useTheme, type ThemeName } from "@/providers/theme-provider";
import { Check, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const THEMES: { name: ThemeName; label: string; color: string; border: string }[] = [
  { name: "default",      label: "Default",     color: "#f7f5f2", border: "#d4c5b0" },
  { name: "astro-vista",   label: "Astro Vista",  color: "#f0f4f8", border: "#cbd5e0" },
  { name: "claude",        label: "Claude",        color: "#fafaf9", border: "#e7e5e4" },
  { name: "light-green",   label: "Light Green",   color: "#f0fdf4", border: "#dcfce7" },
  { name: "mono",          label: "Mono",          color: "#f5f5f5", border: "#e5e5e5" },
  { name: "neobrutualism", label: "Neo",           color: "#ffffff", border: "#000000" },
  { name: "notebook",      label: "Notebook",      color: "#fffdf5", border: "#fef3c7" },
  { name: "supabase",      label: "Supabase",      color: "#1c1c1c", border: "#2e2e2e" },
  { name: "vercel",        label: "Vercel",        color: "#000000", border: "#111111" },
  { name: "whatsapp",      label: "WhatsApp",      color: "#f0f2f5", border: "#d1d7db" },
  { name: "zen",           label: "Zen",           color: "#f8f9fa", border: "#e9ecef" },
];

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-text-3 transition-colors duration-300 hover:bg-muted hover:text-text-2 border border-transparent hover:border-border/40 shadow-sm hover:shadow-md"
        title="Change Theme"
      >
        <Palette size={15} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card shadow-xl shadow-black/5 p-3"
            >
              <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Select Theme
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setTheme(t.name);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg border p-2 transition-all hover:border-primary/50 hover:bg-accent",
                      theme === t.name
                        ? "border-primary bg-primary/5"
                        : "border-border/50"
                    )}
                  >
                    <div
                      className="h-4 w-4 shrink-0 rounded-full border shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: t.color, borderColor: t.border }}
                    />
                    <span className="truncate text-xs font-medium text-foreground">
                      {t.label}
                    </span>
                    {theme === t.name && (
                      <Check
                        size={10}
                        className="absolute right-2 top-2 text-primary"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
