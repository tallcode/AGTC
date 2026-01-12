import path from 'node:path'
import { fileURLToPath } from 'node:url'
import minifyHTML from 'rollup-plugin-minify-html-literals-v3'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: './',
  plugins: [minifyHTML()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          html2canvas: ['html2canvas'],
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'html2canvas') {
            return 'assets/[name].js'
          }
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
