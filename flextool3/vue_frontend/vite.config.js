import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  appType: "custom",
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: "/static/flextool3/",
  build: {
    outDir: resolve(__dirname, '../static/flextool3/'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.js'),
        detail: resolve(__dirname, 'src/detail.js'),
        edit: resolve(__dirname, "src/edit.js"),
        entities: resolve(__dirname, "src/entities.js"),
        scenarios: resolve(__dirname, "src/scenarios.js"),
        run: resolve(__dirname, "src/run.js"),
        results: resolve(__dirname, "src/results.js"),
        "upgrade-notification": resolve(__dirname, "src/upgradeNotification.js"),
      },
      output: {entryFileNames: "[name].js"},
    },
  },
})
