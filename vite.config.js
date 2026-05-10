import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
    },
  },
  // Exclude api directory from frontend build — it's serverless functions for Vercel
  server: {
    watch: {
      ignored: ['**/api/**'],
    },
  },
})
