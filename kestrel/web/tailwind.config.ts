import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: c("bg"), surface: c("surface"), "surface-2": c("surface-2"), "surface-3": c("surface-3"),
        line: c("line"), "line-strong": c("line-strong"),
        fg: c("fg"), muted: c("muted"), subtle: c("subtle"),
        primary: { DEFAULT: c("primary"), fg: c("primary-fg"), soft: c("primary-soft") },
        cyan: { DEFAULT: c("cyan"), soft: c("cyan-soft") }, violet: { DEFAULT: c("violet"), soft: c("violet-soft") },
        success: { DEFAULT: c("success"), soft: c("success-soft") }, warning: { DEFAULT: c("warning"), soft: c("warning-soft") },
        danger: { DEFAULT: c("danger"), soft: c("danger-soft") },
      },
      fontFamily: { sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"], mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"] },
      fontSize: { "2xs": ["0.6875rem", { lineHeight: "1rem" }] },
      borderRadius: { lg: "10px", xl: "14px", "2xl": "18px" },
      boxShadow: {
        card: "0 1px 0 rgb(var(--shadow) / 0.04), 0 1px 3px rgb(var(--shadow) / 0.06)",
        pop: "0 12px 32px -8px rgb(var(--shadow) / 0.28), 0 2px 6px rgb(var(--shadow) / 0.12)",
      },
      keyframes: { shimmer: { "100%": { transform: "translateX(100%)" } } },
      animation: { shimmer: "shimmer 1.4s infinite" },
    },
  },
  plugins: [animate],
} satisfies Config;
