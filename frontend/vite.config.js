import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Solo en desarrollo: redirige /api al backend local para no depender de CORS.
    // En producción se usa la variable VITE_API_URL (ver .env.example).
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
