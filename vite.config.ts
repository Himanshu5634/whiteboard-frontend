import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // --- THIS IS THE CHANGE ---
  // This tells Vite to create the 'dist' folder inside the parent directory's 'Backend' folder.
  build: {
    outDir: '../Backend/dist',
  },
})
