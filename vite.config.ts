import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path for GitHub Pages: /xp-map/dashboard/
  // For local dev/preview, Vite handles this automatically
  base: '/xp-map/dashboard/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
