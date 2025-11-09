import fs from 'fs'
import * as path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ protocolImports: true })
  ],
  define: {
    global: 'globalThis'
  },
  esbuild: {
  loader: 'jsx',
  include: /src\/.*\.js$/,
  exclude: []
},
  server: {
    port: 3000,
    proxy: 'https://pixinvent.com/',
    cors: {
      origin: ['https://pixinvent.com/', 'http://localhost:3000'],
      methods: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules', './src/assets']
      }
    },
    postcss: {
      plugins: [require('postcss-rtl')()]
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
      '@store': path.resolve(__dirname, 'src/redux'),
      '@configs': path.resolve(__dirname, 'src/configs'),
      '@styles': path.resolve(__dirname, 'src/@core/scss'),
      '@utils': path.resolve(__dirname, 'src/utility/Utils'),
      '@hooks': path.resolve(__dirname, 'src/utility/hooks'),
      '@assets': path.resolve(__dirname, 'src/@core/assets'),
      '@layouts': path.resolve(__dirname, 'src/@core/layouts'),
      '@components': path.resolve(__dirname, 'src/@core/components')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\\.*\.js$/ }, async args => ({
              loader: 'jsx',
              contents: await fs.readFileSync(args.path, 'utf8')
            }))
          }
        }
      ]
    }
  }
})
