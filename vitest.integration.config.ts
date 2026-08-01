import { defineConfig } from "vitest/config";
import path from "node:path";

// Tests d'intégration : base PostgreSQL réelle (pas de mock), cf.
// technique/00-cadrage-technique.md §4.1.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL_TEST ??
        "postgresql://gestionlocative:gestionlocative_dev@localhost:5432/gestionlocative_test",
    },
  },
});
