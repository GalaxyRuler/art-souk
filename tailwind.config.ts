import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
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
        soukk: {
          "majorelle-blue": "var(--soukk-majorelle-blue)",
          "majorelle-dark": "var(--soukk-majorelle-dark)",
          "majorelle-light": "var(--soukk-majorelle-light)",
          "terracotta": "var(--soukk-terracotta)",
          "terracotta-dark": "var(--soukk-terracotta-dark)",
          "terracotta-light": "var(--soukk-terracotta-light)",
          "gold": "var(--soukk-gold)",
          "gold-dark": "var(--soukk-gold-dark)",
          "gold-light": "var(--soukk-gold-light)",
          "sand": "var(--soukk-sand)",
          "sand-light": "var(--soukk-sand-light)",
          "sand-dark": "var(--soukk-sand-dark)",
          "charcoal": "var(--soukk-charcoal)",
          "charcoal-light": "var(--soukk-charcoal-light)",
          "charcoal-dark": "var(--soukk-charcoal-dark)",
          "background": "var(--soukk-background)",
          "surface": "var(--soukk-surface)",
          "text-primary": "var(--soukk-text-primary)",
          "text-secondary": "var(--soukk-text-secondary)",
          "border": "var(--soukk-border)",
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
