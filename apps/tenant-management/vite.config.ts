import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    esbuild: {
      drop: isProd ? ["debugger"] : [],
      pure: isProd ? ["console.log", "console.debug"] : [],
    },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router", "@tanstack/react-query"],
    },
    server: {
      port: 5173,
      warmup: {
        clientFiles: ["./app/**/!(*.server|*.test)*.tsx"],
      },
    },
    build: {
      minify: true,
      sourcemap: false,
    },
  };
});
