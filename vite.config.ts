import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // ścieżki względne — działa i na GitHub Pages (podkatalog /claude-test/), i lokalnie
  base: "./",
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "zustand", "framer-motion"],
  },
  server: {
    port: 5178,
    strictPort: false,
    host: true,
  },
});
