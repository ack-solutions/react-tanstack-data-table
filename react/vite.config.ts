/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/react',
  server:{
    port: 4200,
    host: 'localhost',
    fs: {
      strict: false
    }
  },
  preview:{
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@ackplus/react-mui-tanstack-data-table': path.resolve(__dirname, '../packages/src'),
      'react-is': path.resolve(__dirname, '../node_modules/react-is'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-is',
      '@emotion/react', 
      '@emotion/styled',
      'prop-types',
      '@mui/material',
      '@mui/utils',
      '@mui/system'
    ],
    force: true
  },
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
}));
