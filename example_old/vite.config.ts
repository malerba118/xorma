import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteRestart from "vite-plugin-restart";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteRestart({
      restart: ["package-lock.json"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
