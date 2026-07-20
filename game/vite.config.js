import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function port(value, fallback) {
  const parsed = Number(value || fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) throw new Error("Harbor ports must be integers between 1 and 65535.");
  return parsed;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = port(env.TOKEN_HARBOR_DEV_PORT, 5173);
  const harborPort = port(env.TOKEN_HARBOR_PORT, 47831);
  const harborOrigin = `http://127.0.0.1:${harborPort}`;
  return {
    plugins: [react()],
    server: {
      port: devPort,
      strictPort: true,
      proxy: { "/api": harborOrigin, "/health": harborOrigin }
    },
    build: { outDir: "dist", emptyOutDir: true }
  };
});
