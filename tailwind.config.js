/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0FDFD",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#00B4B6", // Core Turquoise matching reference image
          600: "#00989A",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          dark: "#083344",
        },
        aqua: {
          400: "#38BDF8",
          500: "#06B6D4",
          600: "#0284C7",
        },
        darkslate: {
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        }
      },
      fontFamily: {
        display: ["Oswald", "Bebas Neue", "sans-serif"],
        body: ["Inter", "Plus Jakarta Sans", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-brush': "url('/images/hero-brush-bg.svg')",
      },
      boxShadow: {
        'glow': '0 0 25px rgba(0, 180, 182, 0.3)',
        'card-hover': '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'wave': 'wave 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
