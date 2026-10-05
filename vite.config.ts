import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
      includeAssests: ['favicon.svg', 'apple-touch-icon.svg', 'icons/*.png'],
      manifest: {
        name: 'Neutral Industrial Camera',
        short_name: 'NICamera',
        description: 'An AI photography coach tuned to the Neutral Industrial aesthetic',
        start_url: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay'],
        background_color: '#1C1E1F',
        theme_color: '#1C1E1F',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/camera-portrait.png',
            sizes: '1242x2688',
            type: 'image/png',
            platform: 'ios',
          },
        ],
        prefer_related_applications: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@aesthetic': '/src/aesthetic',
      '@camera': '/src/camera',
      '@ai': '/src/ai',
      '@gallery': '/src/gallery',
      '@editor': '/src/editor',
      '@hooks': '/src/hooks',
      '@services': '/src/services',
      '@storage': '/src/storage',
      '@utils': '/src/utils',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'cross-origin',
    },
  },
  build: {
    target: 'ES2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
});
