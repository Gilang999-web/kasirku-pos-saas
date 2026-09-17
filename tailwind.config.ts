import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF3F0',
          100: '#FBE6E1',
          200: '#F5C1B6',
          300: '#EE9683',
          400: '#E76C54',
          500: '#E05338', // Brand primary accent
          600: '#C9432B',
          700: '#A3331F',
          800: '#7E2718',
          900: '#5A1C11',
        },
        canvas: {
          light: '#FBFBFA',
          grid: '#E8E8E6',
          card: '#FFFFFF',
          muted: '#F4F4F2',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#4B5563',
          muted: '#64748B',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        }
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'serif'],
        sans: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 8px 30px -4px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(224, 83, 56, 0.08)',
        'elevated': '0 16px 40px -8px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
};

export default config;
