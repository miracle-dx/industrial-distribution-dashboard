import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/industrial-distribution-dashboard/",
  test: {
    globals: true, // 开启全局test/expect，不用手动导入
    environment: 'jsdom', // 模拟浏览器环境（测React组件必须）
    setupFiles: './test.setup.js', // 引入jest-dom扩展
    testMatch: ['**/*.test.{js,jsx}'], // 精准匹配测试文件
    exclude: ['node_modules', 'dist']  // 排除无关目录
  }
})
