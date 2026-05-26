import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api/places': {
          target: 'https://maps.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost')
            const endpoint = url.searchParams.get('endpoint')
            url.searchParams.delete('endpoint')
            url.searchParams.set('key', env.GOOGLE_PLACES_KEY ?? '')

            const endpoints: Record<string, string> = {
              geocode: '/maps/api/geocode/json',
              nearbysearch: '/maps/api/place/nearbysearch/json',
              details: '/maps/api/place/details/json',
            }

            return (endpoints[endpoint ?? ''] ?? '/maps/api/geocode/json') + url.search
          },
        },
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: () => '/v1/messages',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', env.ANTHROPIC_KEY ?? '')
              proxyReq.setHeader('anthropic-version', '2023-06-01')
              proxyReq.removeHeader('origin')
            })
          },
        },
      },
    },
  }
});
