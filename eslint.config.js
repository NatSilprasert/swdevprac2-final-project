import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");

export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/next-env.d.ts",
      // Backend is vendored from SWDevPrac2-69-1/PJ02-EquipmentRent (CommonJS, own style).
      "apps/api/**",
    ],
  },

  // Web: Next.js + TypeScript + Prettier
  ...nextConfigs.map((c) => ({ ...c, files: ["apps/web/**/*.{ts,tsx,js,jsx}"] })),
  { files: ["apps/web/**/*.{ts,tsx,js,jsx}"], ...prettierConfig },
  {
    files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
    plugins: { prettier: prettierPlugin },
    rules: {
      "@next/next/no-html-link-for-pages": ["error", "apps/web/src/app/"],
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
]);
