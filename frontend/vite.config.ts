import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- IMPORTANT ---
// If this config is at the REPO ROOT (same folder as package.json),
// keep OUT_DIR as below. If it's inside `frontend/`, change to '../docs'.
const OUT_DIR = path.resolve(__dirname, 'docs');

// GitHub Pages base must match your repo name
const REPO_BASE = '/CR_Demo/';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: REPO_BASE,
  build: {
    outDir: OUT_DIR,   // ensures /docs at the repo root (or ../docs if inside frontend/)
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
