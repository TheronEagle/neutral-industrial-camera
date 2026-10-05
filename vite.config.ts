import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Tailwind v4 ships its own PostCSS/Vite plugin. Without this the
    // `@tailwind` directives are emitted verbatim and no utility class
    // exists at runtime.
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        name: 'Neutral Industrial Camera',
        short_name: 'NICamera',
        description: 'An AI photography coach tuned to the Neutral Industrial aesthetic',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#1C1E1F',
        theme_color: '#1C1E1F',
        orientation: 'portrait',
        categories: ['photo', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
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
