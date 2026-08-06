import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // New version এলে active form/chat reload করবে না।
      registerType: 'prompt',

      includeAssets: [
        'icons/apple-touch-icon.png',
      ],

      manifest: {
        id: '/',

        name: 'MONOLITH — The Original Red Brick',
        short_name: 'MONOLITH',

        description:
          'The original red brick. Singular. Eternal. Handcrafted from a single piece of earth.',

        start_url: '/',
        scope: '/',

        // Installed app open হলে browser address bar থাকবে না।
        display: 'standalone',

        background_color: '#150b08',
        theme_color: '#150b08',

        categories: ['shopping', 'lifestyle'],

        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // এগুলো app shell হিসেবে offline cache হবে।
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff,woff2}',
        ],

        // Offline অবস্থায় frontend navigation index.html খুলবে।
        navigateFallback: '/index.html',

        // /api URL-কে frontend page হিসেবে fallback করবে না।
        navigateFallbackDenylist: [
          /^\/api\//,
        ],

        // Google Fonts প্রথমবার load হওয়ার পর cache হবে।
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',

            options: {
              cacheName: 'google-fonts-stylesheets',

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',

            options: {
              cacheName: 'google-fonts-webfonts',

              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})