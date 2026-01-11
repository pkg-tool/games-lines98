import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './', // Use relative paths for assets to work on GitHub Pages and local file preview
  build: {
    rollupOptions: {
      input: 'index.dev.html',
    },
  },
  server: {
    open: '/index.dev.html',
  },
})