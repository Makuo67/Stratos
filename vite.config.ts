import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Uncomment the next two lines if you intend to use componentTagger
// import componentTagger from 'vite-plugin-component-tagger';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
