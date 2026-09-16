import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // caminhos relativos: o build funciona em qualquer pasta ou subdomínio
  base: './',
  plugins: [react(), tailwindcss()],
})
