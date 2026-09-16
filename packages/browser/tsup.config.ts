import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'iife'],
  globalName: 'BreakFlow',
  dts: true,
  sourcemap: true,
  clean: true
});
