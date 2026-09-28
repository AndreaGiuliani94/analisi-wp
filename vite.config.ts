import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Aggiorna automaticamente la PWA
      manifest: {
        name: 'WPStudio',
        short_name: 'WPStudio',
        description: 'L\'app definitiva per l\'analisi della pallanuoto. Dimentica i fogli Excel e i taccuini: con WPStudio hai tutto a portata di mano, in tempo reale, direttamente sul tuo dispositivo.',
        theme_color: '#42b883',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/img/icons/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/icons/logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true, // Elimina la vecchia cache
        navigateFallback: '/', // Assicura che la navigazione funzioni
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache'
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Controlliamo solo i pacchetti esterni
          if (id.includes('node_modules')) {
            
            // Chunk per l'ecosistema Vue
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue';
            }
            
            // Chunk per le icone (presumo Heroicons)
            if (id.includes('@heroicons')) {
              return 'vendor-icons';
            }
            
            // Chunk per ExcelJS e FileSaver
            if (id.includes('file-saver') || id.includes('exceljs')) {
              return 'vendor-excel';
            }

            // Tutto il resto finirà in un chunk generico "vendor"
            return 'vendor';
          }
        }
      }
    }
  }
})
