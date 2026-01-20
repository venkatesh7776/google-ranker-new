import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// Force rebuild for Render deployment
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  preview: {
    port: 3000,
    host: "::",
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configure for SPA routing
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Strip console statements in production build
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  // Ensure public files (including _redirects) are copied to dist
  publicDir: 'public',
}));
