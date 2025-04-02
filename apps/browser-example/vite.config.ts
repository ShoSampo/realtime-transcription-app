import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数をロード
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: "", // This makes Vite use relative paths
    plugins: [react()],
    css: {
      // https://vite.dev/config/shared-options.html#css-preprocessoroptions
      preprocessorOptions: {
        scss: {
          // https://sass-lang.com/documentation/js-api/interfaces/options/#quietDeps
          quietDeps: true,
        },
      },
    },
    // 環境変数を定義
    define: {
      'process.env': env
    }
  }
})
