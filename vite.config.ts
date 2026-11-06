import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const servicePort = env.SERVICE_PORT || "3000";

  return {
    plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": `http://localhost:${servicePort}`,
      },
    },
    test: {
      include: ["src/**/*.test.{ts,tsx}"],
      environment: "jsdom",
    },
  };
});
