import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  { settings: { next: { rootDir: ["apps/web/", "apps/admin/"] } } },
  {
    // Admin ADM-09: every backend call goes through the API helper, so each carries the 2FA token,
    // a timeout and the same error handling.
    files: ["apps/admin/src/**/*.{ts,tsx}"],
    ignores: ["apps/admin/src/lib/api/**"],
    rules: {
      "no-restricted-globals": ["error", { name: "fetch", message: "Call the backend through the admin API helper (useAdminApi, src/lib/api)." }],
    },
  },
  globalIgnores(["**/.next/**", "**/next-env.d.ts", "**/coverage/**"]),
]);
