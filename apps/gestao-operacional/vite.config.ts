import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/gest-o-operacional-para-hot-is-main/',
      build: {
        outDir: 'build-kinghost',
        rollupOptions: {
          output: {
            entryFileNames: 'assets/app.js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name][extname]',
          },
        },
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'globalThis.__AI_API_URL__': JSON.stringify(env.AI_API_URL || 'http://localhost:3001'),
        'globalThis.__GOOGLE_CLIENT_ID__': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || '')
      },
      resolve: {
        dedupe: ['react', 'react-dom', 'react-router-dom'],
        alias: [
          { find: '@', replacement: path.resolve(__dirname, '.') },
          { find: /^(\.\.\/)+shared/, replacement: path.resolve(__dirname, '../site/shared') },
        ]
      }
    };
});
