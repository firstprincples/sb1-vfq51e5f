import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    include: ['mathlive']
  },
  build: {
    commonjsOptions: {
      include: [/mathlive/, /node_modules/]
    }
  },
  server: {
    fs: {
      strict: false
    }
  },
  // Add public directory configuration
  publicDir: 'public'
})