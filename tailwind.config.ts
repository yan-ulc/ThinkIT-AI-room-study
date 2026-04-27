import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

const config: Config = {
  // Aktifkan dark mode berbasis class
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",

        // Backward-compatible aliases used throughout existing components.
        bg: "var(--background)",
        surface: "var(--card)",
        surface2: "var(--muted)",
        text: {
          DEFAULT: "var(--foreground)",
          1: "var(--foreground)",
          2: "var(--foreground)",
          3: "var(--muted-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["var(--font)", "sans-serif"],
        mono: ["var(--mono)", "monospace"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;

export default config;
