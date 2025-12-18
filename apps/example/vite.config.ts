import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 4200
  },
  resolve: {
    alias: {
      '@ackplus/react-tanstack-data-table': path.resolve(
        __dirname,
        '../..',
        'packages/react-tanstack-data-table/src'
      )
    }
  },
  plugins: [react()]
});
