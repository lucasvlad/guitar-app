import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Regenerate the PNG icons in public/ with: npx pwa-assets-generator
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#121212' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#121212' } },
  },
  images: ['public/favicon.svg'],
})
