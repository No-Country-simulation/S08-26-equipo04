// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy a Render para dev y para `vite preview` (el preview no hereda
// `server.proxy`: sin esto el build local no puede loguearse por CORS en
// localhost:4173). Solo aplica con baseURL relativa (VITE_API_BASE_URL
// vacía); con la var seteada el cliente va directo al backend.
const proxyApi = {
  "/api": {
    target: "https://s08-26-equipo04-ay4l.onrender.com",
    // Deploy alternativo (temporal):
    // target: "https://s08-26-equipo04.onrender.com",
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // FE-288: solo React e iconos salen a chunks propios. Los iconos
        // (lucide-react) generaban ~100 archivos de <1 kB que saturaban las
        // conexiones; van juntos en uno solo (el shell los usa igual).
        // El resto usa el chunking por defecto para no arrastrar las
        // dependencias de `recharts` (d3-*) al bundle inicial: deben viajar
        // con el chunk diferido de GraficosGerente, solo para Gerente.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("lucide-react")) return "icons";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    proxy: proxyApi,
  },
  preview: {
    proxy: proxyApi,
  },
});
