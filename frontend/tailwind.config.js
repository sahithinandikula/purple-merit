/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#f3f4f6",
        panel: "#ffffff",
        border: "rgba(15, 23, 42, 0.08)",
        ink: "#0f172a",
        muted: "#64748b",
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.08)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at top, rgba(255,255,255,0.95), rgba(243,244,246,0.72) 45%, rgba(226,232,240,0.8) 100%)",
      },
    },
  },
  plugins: [],
};
