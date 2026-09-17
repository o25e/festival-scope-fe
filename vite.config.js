import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const createNaverLocalSearchProxy = (env) => ({
  target: 'https://naverapihub.apigw.ntruss.com',
  changeOrigin: true,
  secure: true,
  rewrite: (path) => path.replace(/^\/api\/naver\/local-search/, '/search/v1/local'),
  headers: {
    Accept: 'application/json',
    'X-NCP-APIGW-API-KEY-ID': env.NAVER_SEARCH_CLIENT_ID,
    'X-NCP-APIGW-API-KEY': env.NAVER_SEARCH_CLIENT_SECRET,
  },
  configure: (proxy) => {
    proxy.on('proxyRes', (proxyResponse, request) => {
      const chunks = []
      proxyResponse.on('data', (chunk) => chunks.push(chunk))
      proxyResponse.on('end', () => {
        const status = proxyResponse.statusCode || 502
        if (status >= 400) {
          console.error(
            `[NAVER API HUB] ${status} ${Buffer.concat(chunks).toString('utf8')}`,
          )
        }
      })
      if (statusCodeIsError(proxyResponse.statusCode)) {
        console.error(
          `[NAVER API HUB] ${request.method} ${request.url} -> ${proxyResponse.statusCode}`,
        )
      }
    })
  },
})

const statusCodeIsError = (statusCode) => (statusCode || 502) >= 400

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const localSearchProxy = createNaverLocalSearchProxy(env)

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/naver/local-search': localSearchProxy,
      },
    },
    preview: {
      proxy: {
        '/api/naver/local-search': localSearchProxy,
      },
    },
  }
})
