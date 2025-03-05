import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true
  },
  resolve: {
    dedupe: ['three']
  },
  build: {
    sourcemap: true,
    outDir: 'dist'
  }
});
