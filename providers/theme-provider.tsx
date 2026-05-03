"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type ThemeName =
  | "default"
  | "astro-vista"
  | "claude"
  | "light-green"
  | "mono"
  | "neobrutualism"
  | "notebook"
  | "supabase"
  | "vercel"
  | "whatsapp"
  | "zen";

export type Mode = "light" | "dark";

export type ToggleOrigin = { x: number; y: number };

type ThemeContextValue = {
  theme: ThemeName;
  mode: Mode;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: Mode) => void;
  toggleMode: (origin?: ToggleOrigin) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME: ThemeName = "default";
const DEFAULT_MODE: Mode = "light";
const TRANSITION_MS = 320;

const STORAGE_THEME_KEY = "thinkit-theme";
const STORAGE_MODE_KEY = "thinkit-mode";

function applyToDOM(theme: ThemeName, mode: Mode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-mode", mode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [mode, setModeState] = useState<Mode>(DEFAULT_MODE);

  const pathname = usePathname();

  // On mount: read from localStorage, apply to DOM, remove no-theme-init guard
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem(STORAGE_THEME_KEY) as ThemeName) ?? DEFAULT_THEME;
    const savedMode =
      (localStorage.getItem(STORAGE_MODE_KEY) as Mode) ?? DEFAULT_MODE;

    setThemeState(savedTheme);
    setModeState(savedMode);
    
    // Initial application logic handles the landing page route
    if (pathname === "/") {
      applyToDOM("astro-vista", "light");
    } else {
      applyToDOM(savedTheme, savedMode);
    }

    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.remove("no-theme-init");
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  /** Change theme — mode stays the same */
  const setTheme = useCallback(
    (next: ThemeName) => {
      if (pathname === "/") return;
      setThemeState(next);
      localStorage.setItem(STORAGE_THEME_KEY, next);
      applyToDOM(next, mode);
    },
    [mode, pathname],
  );

  /** Change mode — theme stays the same */
  const setMode = useCallback(
    (next: Mode) => {
      if (pathname === "/") return;
      setModeState(next);
      localStorage.setItem(STORAGE_MODE_KEY, next);
      applyToDOM(theme, next);
    },
    [theme, pathname],
  );

  /** Toggle light↔dark with circular ripple View Transition */
  const toggleMode = useCallback(
    (origin?: ToggleOrigin) => {
      if (pathname === "/") return;
      const nextMode: Mode = mode === "dark" ? "light" : "dark";

      if (typeof document === "undefined") {
        setMode(nextMode);
        return;
      }

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!document.startViewTransition || prefersReduced) {
        if (!prefersReduced) {
          document.documentElement.classList.add("theme-transitioning");
          setMode(nextMode);
          setTimeout(
            () =>
              document.documentElement.classList.remove("theme-transitioning"),
            TRANSITION_MS,
          );
        } else {
          setMode(nextMode);
        }
        return;
      }

      const cx = origin?.x ?? window.innerWidth / 2;
      const cy = origin?.y ?? window.innerHeight / 2;
      const dx = Math.max(cx, window.innerWidth - cx);
      const dy = Math.max(cy, window.innerHeight - cy);
      const maxRadius = Math.ceil(Math.hypot(dx, dy));

      document.documentElement.style.setProperty("--vt-cx", `${cx}px`);
      document.documentElement.style.setProperty("--vt-cy", `${cy}px`);
      document.documentElement.style.setProperty("--vt-r", `${maxRadius}px`);

      const transition = document.startViewTransition(() => {
        setMode(nextMode);
      });

      transition.finished.finally(() => {
        document.documentElement.style.removeProperty("--vt-cx");
        document.documentElement.style.removeProperty("--vt-cy");
        document.documentElement.style.removeProperty("--vt-r");
      });
    },
    [mode, setMode],
  );

  return (
    <ThemeContext.Provider
      value={{ theme, mode, isDark: mode === "dark", setTheme, setMode, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
