import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure proper module output
    target: "es2015",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vite 8 uses Rolldown - manualChunks must be a function
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("vue-router")) {
              return "vendor";
            }
          }
        },
      },
    },
  },
  // Ensure base path is correct for production
  base: "/",
});
