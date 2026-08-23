import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self)',
  'Content-Security-Policy':
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://pagead2.googlesyndication.com https://accounts.google.com; connect-src 'self' https: http://localhost:3001 http://127.0.0.1:3001 https://accounts.google.com; frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://accounts.google.com",
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      build: {
        outDir: 'build',
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
        headers: securityHeaders,
        proxy: {
          '/api': env.AI_PROXY_TARGET || 'http://localhost:3001',
        },
      },
      preview: {
        headers: securityHeaders,
      },
      plugins: [react()],
      define: {
        'globalThis.__AI_API_URL__': JSON.stringify(env.VITE_AI_API_URL || env.AI_API_URL || ''),
        'globalThis.__GOOGLE_CLIENT_ID__': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || '')
      },
      resolve: {
        dedupe: ['react', 'react-dom', 'react-router-dom'],
        alias: {
          '@': path.resolve(__dirname, '.'),
          'react-router-dom': path.resolve(__dirname, '../gestao-operacional/node_modules/react-router-dom'),
          recharts: path.resolve(__dirname, '../gestao-operacional/node_modules/recharts'),
        }
      }
    };
});
