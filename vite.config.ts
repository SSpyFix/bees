import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Relative assets work on GitHub project Pages and custom domains.
  base: "./",
  test: { include: ["src/tests/**/*.test.ts"] },
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          id.includes("node_modules/three/")
            ? "three"
            : id.includes("node_modules/")
              ? "vendor"
              : undefined,
      },
    },
  },
});
