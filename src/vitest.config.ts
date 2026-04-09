import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./src/**/*.test.ts'],
    exclude: ['./src/**/*.unit.test.ts', 'node_modules'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules']
    },
    setupFiles: ['./src/shared/test/test.setup.ts']
  }
})
