/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 12px 30px rgba(15, 23, 42, 0.08)"
      },
      colors: {
        bg: "var(--bg)",
        "bg-accent": "var(--bg-accent)",
        panel: "var(--panel)",
        "panel-muted": "var(--panel-muted)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
        border: "var(--border)"
      }
    }
  },
  plugins: []
};
