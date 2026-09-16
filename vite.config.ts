import { join } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import svgr from "vite-plugin-svgr";

import { apiMiddleware } from "./server/api.ts";

/**
 * Mounts the SQLite-backed mock API inside the dev server, so the playground
 * stays a single app on a single port: `/api/*` is answered here, everything
 * else falls through to Vite.
 */
function mockApi(): Plugin {
  return {
    name: "bliro-mock-api",
    configResolved(config) {
      // See the comment on serverDir() in server/db.ts — this config file is
      // bundled to a temp location, so the server folder is resolved from the
      // project root Vite gives us rather than from import.meta.url.
      process.env.BLIRO_SERVER_DIR = join(config.root, "server");
    },
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), mockApi()],
  resolve: {
    // Vite 8 resolves tsconfig `paths` natively — @bliro/ui/* and @/* come
    // straight from tsconfig.json, no duplicate alias map to keep in sync.
    tsconfigPaths: true,
  },
  // Same escape hatch apps/web-app uses in the monorepo. Vite 8 (Rolldown)
  // changed CJS default-import interop, which makes `import X from "pkg"` yield
  // the module namespace for deps that set `__esModule` inside their factory —
  // rendering the result then throws "Element type is invalid ... got: object".
  // It bites @mui/icons-material and react-textarea-autosize here. Drop this
  // when those deps ship ESM-first (MUI v6+).
  legacy: {
    inconsistentCjsInterop: true,
  },
  server: {
    port: 3000,
    host: "localhost",
    open: true,
  },
});
