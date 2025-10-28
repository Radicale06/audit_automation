import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'tsparticles-slim'],
  },
  resolve: {
    alias: {
      'react-particles': '@tsparticles/react',
    },
  },
  // Ensure a stable dev server port to avoid stale module URLs (5173 vs 5174)
  server: {
    port: 5174,
    strictPort: true,
  },
});
