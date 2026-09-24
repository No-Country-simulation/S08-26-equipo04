// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://s08-26-equipo04-ay4l.onrender.com",
        // Deploy alternativo (temporal):
        // target: "https://s08-26-equipo04.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
