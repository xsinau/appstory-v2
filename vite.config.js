import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  
  base: '/appstory-v2/', 
  

  root: resolve(__dirname, 'src'),
  
 
  publicDir: resolve(__dirname, 'src/public'),
  
  build: {
    
    outDir: resolve(__dirname, 'docs'),
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  plugins: [
    VitePWA({
  registerType: 'autoUpdate',
  
  strategies: 'injectManifest', 
  
  srcDir: 'scripts', 
  filename: 'sw.js', 
  
  devOptions: {
    enabled: true,
    type: 'module',
  },
  
  injectManifest: {
    // Ini penting agar Vite tahu file apa saja yang harus di-precache
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },

      // Konfigurasi Workbox untuk menangani Mode Offline 
      workbox: {
        // Cache semua file statis yang ada di folder dist setelah build
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        
        // Memastikan saat offline, refresh halaman tetap kembali ke index.html (App Shell)
        navigateFallback: '/appstory-v2/index.html',
        
        // Caching runtime untuk aset eksternal seperti Fonts atau API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'story-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      },

      // Konfigurasi Web App Manifest untuk Fitur Installable 
      manifest: {
        name: 'Story App',
        short_name: 'StoryApp',
        description: 'Aplikasi berbagi cerita dengan fitur offline',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/appstory-v2/',
        start_url: '/appstory-v2/',
        icons: [
          {
         
            src: 'images/logo.png',
            sizes: '512x512', 
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop Version'
          },
          {
            src: 'images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            
            label: 'Mobile Version'
          }
        ]
      }
    })
  ]
});