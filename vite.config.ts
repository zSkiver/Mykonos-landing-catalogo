import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        // Separa as bibliotecas grandes para que uma mudança de código
        // não invalide o cache delas no navegador. `supabase` e `gsap` só
        // são baixados quando algo os importa dinamicamente.
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router)/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)/ },
            { name: 'gsap', test: /node_modules[\\/]gsap/, priority: 10 },
            { name: 'supabase', test: /node_modules[\\/]@supabase/, priority: 10 },
          ],
        },
      },
    },
  },
});
