import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // When deploying to GitHub Pages under a repository (https://username.github.io/SafeRoots/)
  // Vite needs the `base` option so asset URLs include the repo name.
  base: '/SafeRoots/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
