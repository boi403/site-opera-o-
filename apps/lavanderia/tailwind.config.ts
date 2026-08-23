import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Nunito Sans", "sans-serif"],
      },
      colors: {
        // Paleta oficial do Araguaia Palace Hotel (mesma do site institucional).
        hotel: {
          50: "#eef4f8",
          100: "#d7e5ee",
          200: "#afc9dd",
          300: "#82a9c7",
          400: "#5687ab",
          500: "#356a8c",
          600: "#235271",
          700: "#173e58",
          800: "#0f2c40",
          900: "#002D44",
          950: "#001927",
        },
        accent: {
          DEFAULT: "#E31B23",
          dark: "#c4161d",
        },
        brandGold: "#FFD700",
      },
      boxShadow: {
        gold: "0 8px 30px -8px rgba(227, 27, 35, 0.45)",
        "gold-lg": "0 24px 60px -12px rgba(0, 45, 68, 0.35)",
        "inner-gold": "inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -1px 0 0 rgba(0,45,68,0.08)",
        glass: "0 1px 0 0 rgba(255,255,255,0.6) inset, 0 20px 40px -20px rgba(0,45,68,0.35)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FFE580 0%, #FFD700 50%, #C1A376 100%)",
        "gold-radial": "radial-gradient(circle at 30% 20%, rgba(255,215,0,0.35), transparent 60%)",
        "mesh-hero": "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(0,45,68,0.14), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 15%, rgba(227,27,35,0.10), transparent 55%), radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,215,0,0.14), transparent 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate3d(1,1,0,0deg)" },
          "50%": { transform: "translate3d(0,-14px,0) rotate3d(1,1,0,2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "spin-slow": "spin-slow 18s linear infinite",
      },
      perspective: {
        near: "800px",
        DEFAULT: "1200px",
        far: "1800px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".perspective": { perspective: "1200px" },
        ".perspective-near": { perspective: "800px" },
        ".preserve-3d": { transformStyle: "preserve-3d" },
        ".backface-hidden": { backfaceVisibility: "hidden" },
      });
    },
  ],
};
export default config;
