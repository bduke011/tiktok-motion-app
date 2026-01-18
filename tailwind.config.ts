import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#161823",
        primary: "#fe2c55",
        secondary: "#25f4ee",
        "text-primary": "#ffffff",
        "text-muted": "#8a8b91",
      },
    },
  },
  plugins: [],
} satisfies Config;
