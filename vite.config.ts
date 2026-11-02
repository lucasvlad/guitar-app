/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app at /guitar-app/. Set BASE_PATH=/ for a host that serves at the root.
const base = process.env.BASE_PATH ?? '/guitar-app/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'Fretboard Trainer',
        short_name: 'Fretboard',
        description: 'Daily guitar fretboard and music theory practice.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121212',
        theme_color: '#121212',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
