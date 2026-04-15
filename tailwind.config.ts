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
        // Mapping warna dari desain HTML ThinkIT
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        primary: {
          DEFAULT: "var(--primary)",
          muted: "var(--primary-muted)",
          light: "var(--primary-light)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          muted: "var(--accent-muted)",
        },
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        ai: {
          surface: "var(--ai-surface)",
          border: "var(--ai-border)",
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
  plugins: [],
} satisfies Config;

export default config;
