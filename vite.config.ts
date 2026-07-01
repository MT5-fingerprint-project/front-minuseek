import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [svgr(), react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        // Seul /media est proxifié : images servies par le back en storage local (pont dev,
        // supprimé quand la dev passera sur le bucket GCS).
        '/media': {
          target: env.API_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})