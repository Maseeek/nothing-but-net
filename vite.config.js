import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure the dev server for SPA routing
    historyApiFallback: true,
  },
  preview: {
    // Configure the preview server for SPA routing
    historyApiFallback: true,
  }
})
