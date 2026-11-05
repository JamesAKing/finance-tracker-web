import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const servicePort = env.SERVICE_PORT || "3000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": `http://localhost:${servicePort}`,
      },
    },
    test: {
      include: ["src/**/*.test.{ts,tsx}"],
      // Plain Node for now. Switch to "jsdom" when the first component test needs a DOM.
      environment: "node",
    },
  };
});
