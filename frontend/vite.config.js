import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sitemap.xml': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
