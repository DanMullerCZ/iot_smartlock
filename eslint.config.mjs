import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default defineConfig([
    // ── Next.js base (React, hooks, jsx-a11y, web-vitals) ──────────────────
    ...nextVitals,
    ...nextTs,

    // ── TypeScript strict type-checked ──────────────────────────────────────
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // ── Project rules ────────────────────────────────────────────────────────
    {
        plugins: {
            import: importPlugin,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Enforce `import type` for type-only imports
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-import-type-side-effects": "error",

            // Warn on console.* left in code (use a proper logger instead)
            "no-console": "warn",

            // Import order: builtin → external → internal (@/*) → relative
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
                    pathGroups: [{ pattern: "@/**", group: "internal", position: "after" }],
                    pathGroupsExcludedImportTypes: ["builtin"],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],

            // Always use block bodies: () => { return x; } not () => x
            "arrow-body-style": ["error", "always"],
            // Always use braces: if (x) { return y; } not if (x) return y;
            curly: ["error", "multi-line"],

            // ── Escape hatches if strict-type-checked is too noisy ───────────────
            // "@typescript-eslint/no-explicit-any": "warn",
            // "@typescript-eslint/no-unsafe-assignment": "warn",
            // "@typescript-eslint/no-unsafe-member-access": "warn",
        },
    },

    // ── Prettier last — disables all ESLint formatting rules ─────────────────
    prettierConfig,

    globalIgnores([".next/**", "out/**", "build/**", "generated/**", "next-env.d.ts"]),
]);
