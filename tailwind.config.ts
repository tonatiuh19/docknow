import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
        },
        ocean: {
          50: "#e6fcff",
          100: "#b3f5ff",
          200: "#80edff",
          300: "#4de4ff",
          400: "#1ad9ff",
          500: "#00c4e6",
          600: "#0099b3",
          700: "#006d80",
          800: "#00424d",
          900: "#00171a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        shake: "shake 0.5s ease-in-out",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        slideDown: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": {
            transform: "translateY(30px) scale(0.95)",
            opacity: "0",
            filter: "blur(10px)",
          },
          "100%": {
            transform: "translateY(0) scale(1)",
            opacity: "1",
            filter: "blur(0px)",
          },
        },
        slideDown: {
          "0%": {
            transform: "translateY(-10px) scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0) scale(1)",
            opacity: "1",
          },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        scaleIn: {
          "0%": {
            transform: "scale(0.9)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        shimmer: {
          "0%, 100%": {
            backgroundPosition: "200% center",
          },
          "50%": {
            backgroundPosition: "-200% center",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
