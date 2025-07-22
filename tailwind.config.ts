import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    // Radix UI attribute-variant prefixes (keep them during purge)
    { pattern: /data-\[state=(open|closed|on|off|checked|unchecked|delayed-open|instant-open)\]/ },
    { pattern: /data-\[side=(top|right|bottom|left)\]/ },
    { pattern: /data-\[align=(start|center|end)\]/ },
    { pattern: /data-\[orientation=(horizontal|vertical)\]/ },
    // Dynamic z-index classes
    'z-50', 'z-[9999]', 'z-[10000]', 'z-[10001]',
    // Radix Select specific classes
    'max-h-[--radix-select-content-available-height]',
    'min-w-[--radix-select-trigger-width]',
    'h-[var(--radix-select-trigger-height)]',
    'w-[var(--radix-select-trigger-width)]',
    'origin-[--radix-select-content-transform-origin]',
    // Common utility classes that might be stripped
    'pointer-events-none',
    'overflow-hidden',
    'whitespace-nowrap',
    'text-ellipsis'
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        brand: {
          gold: "var(--brand-gold)",
          navy: "var(--brand-navy)",
          "deep-navy": "var(--brand-deep-navy)",
          steel: "var(--brand-steel)",
          charcoal: "var(--brand-charcoal)",
          "light-gold": "var(--brand-light-gold)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;