import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
    VitePWA({ registerType: 'autoUpdate', injectRegister: 'auto',workbox:{
      globPatterns: [
        '**/*.{js,css,html,ts,vue}',
      ],
    }})],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  }
})
