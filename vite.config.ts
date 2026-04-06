import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@dnd-kit")) return "vendor-dnd";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("howler")) return "vendor-audio";
            return "vendor";
          }
          if (id.includes("src/components/interactives/")) {
            return "interactives";
          }
        },
      },
    },
  },
});
