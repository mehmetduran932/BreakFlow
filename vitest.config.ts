import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'packages/*/src/**/*.{test,spec}.ts', 'tests/unit/**/*.{test,spec}.ts']
  }
});
