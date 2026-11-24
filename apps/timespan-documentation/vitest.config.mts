import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    outputFile: {
      junit: './reports/junit.xml',
    },
  },
});
