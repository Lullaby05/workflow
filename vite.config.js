import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 开发或生产环境服务的公共基础路径
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      // 配置路径别名
      '@': resolve('src'),
    },
  },
  css: {
    preprocessorOptions: {
      // css预处理器
      less: {
        // 引入全局的Less库，有关lib.less请看 → https://www.jianshu.com/p/b13e2a2204b2
        additionalData: '@import "./src/assets/theme.less";',
      },
    },
  },
  optimizeDeps: {
    include: [
      `monaco-editor/esm/vs/language/json/json.worker`,
      `monaco-editor/esm/vs/language/css/css.worker`,
      `monaco-editor/esm/vs/language/html/html.worker`,
      `monaco-editor/esm/vs/language/typescript/ts.worker`,
      `monaco-editor/esm/vs/editor/editor.worker`,
    ],
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: "import { h } from 'vue';",
  },
  build: {
    sourcemap: false,
  },
  server: {
    //vue3 vite配置热更新不用手动刷新
    hmr: true,
    host: '0.0.0.0',
    proxy: {
      '/businessApi': {
        target: 'http://172.16.16.9:10000',
        changeOrigin: true,
      },
      '/outer': {
        target: 'http://172.16.16.9:32200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/outer/, '/businessApi'),
      },
    },
  },
});
