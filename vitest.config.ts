import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['server/modules/talent/**/*.spec.ts'], pool: 'forks', globals: true },
});
