"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { useCallback, useRef } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type AppThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setTheme: (nextTheme: Theme) => void;
  toggleTheme: () => void;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="thinkit-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const currentTheme = (theme ?? "light") as Theme;
  const currentResolved = (resolvedTheme ?? theme ?? "light") as ResolvedTheme;
  const switchingTimerRef = useRef<number | null>(null);

  const setAnimatedTheme = useCallback(
    (nextTheme: Theme) => {
      if (typeof document !== "undefined") {
        if (switchingTimerRef.current) {
          window.clearTimeout(switchingTimerRef.current);
        }
        document.documentElement.classList.add("theme-switching");
        switchingTimerRef.current = window.setTimeout(() => {
          document.documentElement.classList.remove("theme-switching");
          switchingTimerRef.current = null;
        }, 300);
      }
      setTheme(nextTheme);
    },
    [setTheme],
  );

  const toggleTheme = useCallback(() => {
    setAnimatedTheme(currentResolved === "dark" ? "light" : "dark");
  }, [currentResolved, setAnimatedTheme]);

  return {
    theme: currentTheme,
    resolvedTheme: currentResolved,
    isDark: currentResolved === "dark",
    setTheme: setAnimatedTheme,
    toggleTheme,
  } as AppThemeContextValue;
}
